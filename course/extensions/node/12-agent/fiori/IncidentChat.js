sap.ui.define(["sap/m/Dialog", "sap/m/VBox", "sap/m/Text", "sap/m/TextArea", "sap/m/Button", "sap/m/MessageStrip", "sap/m/ScrollContainer"],
function(Dialog, VBox, Text, TextArea, Button, MessageStrip, ScrollContainer) {
  "use strict";
  return { open: function() {
    let contextId, activeRequest, pending;
    let busy = false, uncertain = false;
    let disposed = false;
    const messages = new VBox({items: [new Text({text: "Ask about incidents. Answers may be inaccurate; check the incident list."})]}).addStyleClass("sapUiSmallMargin");
    const input = new TextArea({width:"100%", rows:3, maxLength:4000, placeholder:"Which incidents need attention?"}).addStyleClass("sapUiSmallMarginTop");
    const error = new MessageStrip({type:"Error", visible:false, showIcon:true});
    // Resume format follows @cap-js/agents 0.9.7 lib/preview/chat.html.
    const approve = new Button({text:"Approve", visible:false, press:()=>decide("approve")});
    const reject = new Button({text:"Decline", visible:false, press:()=>decide("reject")});
    function availability() {
      send.setEnabled(!busy && !pending && !uncertain); input.setEnabled(!busy && !pending && !uncertain);
      approve.setEnabled(!busy && !!pending && !uncertain); reject.setEnabled(!busy && !!pending && !uncertain);
      approve.setVisible(!!pending); reject.setVisible(!!pending);
    }
    async function decide(decision) {
      if (!pending || busy || uncertain || disposed) return;
      const current = pending;
      pending = undefined; // Never reuse a decision after a timeout or an ambiguous response.
      await request(decision, current);
    }
    const send = new Button({text:"Send", type:"Emphasized", press:async function() {
      const text = input.getValue().trim();
      if (!text || pending || busy || uncertain || disposed) return;
      await request(text);
    }});
    async function request(text, approval) {
      busy = true; availability();
      send.setEnabled(false); input.setEnabled(false); error.setVisible(false);
      messages.addItem(new Text().setText("You: " + text).addStyleClass("sapUiSmallMarginTop"));
      const controller = new AbortController(); activeRequest = controller; send.setText("Asking…");
      const timeout = setTimeout(()=>controller.abort(), 90000);
      try {
        const message = {kind:"message", messageId:crypto.randomUUID(), role:"user", parts:[{kind:"text",text}]};
        if (contextId) message.contextId = contextId;
        if (approval) { message.taskId = approval.taskId; message.contextId = approval.contextId; }
        const response = await fetch("/a2a/incident-assistant", {method:"POST", credentials:"same-origin", signal:controller.signal,
          headers:{"Content-Type":"application/json",Accept:"application/json"},
          body:JSON.stringify({jsonrpc:"2.0",id:crypto.randomUUID(),method:"message/send",params:{message}})});
        if (!response.ok) throw new Error(response.status===401||response.status===403 ? "Sign in with access to the incident assistant, then try again." : "The assistant is unavailable. Check the CAP server and model connection.");
        const packet = await response.json();
        if (disposed) return;
        if (packet.error) throw new Error("The assistant could not answer. Check the CAP server and model connection.");
        const result = packet.result;
        if (!result) throw new Error("The assistant returned no result.");
        if (approval && result.contextId !== approval.contextId) throw new Error("The assistant returned a different conversation. Check the incident data before continuing.");
        if (result.kind === "task" && result.status?.state === "input-required") {
          uncertain = true; // Until the pending target has been resolved safely.
          const parts = result.status.message?.parts || [];
          const meta = result.status.message?.metadata || {};
          const hitl = meta["sap.cds.agents.hitl"];
          const actions = hitl?.actionRequests || parts.find(p=>p.kind==="data")?.data?.actionRequests;
          const action = actions?.[hitl?.decisions?.length || 0];
          const options = meta["sap.cds.agents.input-required"]?.options || [];
          const taskId = result.id || result.taskId;
          if (!taskId || !result.contextId || !action?.name || !action.args ||
              !options.some(o=>o.value==="approve") || !options.some(o=>o.value==="reject")) {
            uncertain = true;
            throw new Error("This approval request is incomplete. Close this chat and check the browser preview before continuing.");
          }
          // Resolve the displayed target from CAP data, never from model prose.
          const incident = action.args.incident;
          if (action.name !== "raiseUrgency" || typeof incident !== "string" || !/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i.test(incident)) {
            uncertain = true;
            throw new Error("This action is not supported by this chat. Check the browser preview.");
          }
          const recordResponse = await fetch("/odata/v4/incidents/Incidents(ID=" + incident + ",IsActiveEntity=true)?$select=ID,title,status,urgency&$expand=businessPartner($select=name)", {credentials:"same-origin",signal:controller.signal,headers:{Accept:"application/json"}});
          if (!recordResponse.ok) { uncertain = true; throw new Error("Could not verify the incident for approval. Close this chat and check the incident list."); }
          const record = await recordResponse.json();
          if (disposed) return;
          if (record.ID !== incident || !record.title) { uncertain = true; throw new Error("Could not match the approval to an incident. Check the incident list."); }
          contextId = result.contextId;
          pending = {taskId, contextId};
          uncertain = false;
          messages.addItem(new Text().setText("Raise urgency to high for " + (record.businessPartner?.name || "business partner not available") + " — " + record.title + "?\nCurrent status: " + record.status + "; urgency: " + record.urgency + ". To change the target, decline and ask again.").addStyleClass("sapUiSmallMarginTop"));
          const detail = new Text().setText("Action: " + action.name + "\n" + JSON.stringify(action.args, null, 2));
          detail.setVisible(false);
          let detailsVisible = false;
          messages.addItem(new Button({text:"Show technical details",press:function(){ detailsVisible = !detailsVisible; detail.setVisible(detailsVisible); }}));
          messages.addItem(detail);
          input.setValue("");
          return;
        }
        if (result.kind === "task" && result.status?.state !== "completed") throw new Error("The assistant has not completed this request. Check the server before trying again.");
        contextId = result.contextId || contextId;
        const parts = result.parts || (result.status?.message?.parts) || (result.artifacts || []).filter(a=>a.artifactId=== "response").flatMap(a=>a.parts || []);
        const reply = parts.filter(p=>p.kind==="text").map(p=>p.text).join("\n") || (result.status?.message?.parts || []).filter(p=>p.kind==="text").map(p=>p.text).join("\n");
        if (!reply) throw new Error("No answer was returned. Try a more specific question.");
        messages.addItem(new Text().setText("Assistant: " + reply).addStyleClass("sapUiSmallMarginTop"));
        input.setValue("");
        if (approval?.taskId) messages.addItem(new Text({text:"Refresh the Incident Management page to check the current data."}));
      } catch(e) {
        if (disposed) return;
        if (approval) uncertain = true;
        error.setText(approval ? "The action result could not be confirmed. Close this chat and check the incident data before trying again." : e.name==="AbortError" ? "The request timed out. Check the server before retrying." : e.message);
        error.setVisible(true);
      } finally { clearTimeout(timeout); activeRequest = undefined; if (!disposed) { busy = false; send.setText("Send"); availability(); } }
    }
    const dialog = new Dialog({title:"Incident Assistant",contentWidth:"36rem",contentHeight:"30rem",resizable:true,draggable:true,
      content:[new ScrollContainer({height:"20rem",vertical:true,content:[messages]}),error,input,approve,reject],beginButton:send,
      endButton:new Button({text:"Close",press:()=>dialog.close()}),beforeClose:()=>{disposed=true; activeRequest?.abort();},afterClose:()=>dialog.destroy()});
    dialog.open();
  }};
});
