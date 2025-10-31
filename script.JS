    const messageSection = document.getElementById("message-section");
    const input = document.getElementById("chat-input");
    const sendBtn = document.getElementById("send-btn");

    async function askOpenRouter(userText) {
      try {
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: userText })
        });

        const contentType = response.headers.get("content-type") || "";
        if (contentType.includes("application/json")) {
          return await response.json();
        }
        const text = await response.text();
        return { error: { message: text || "Invalid JSON from server" } };
      } catch (err) {
        return { error: { message: err && err.message ? err.message : "Network error" } };
      }
    }

    function addMessage(content, isUser) {
      const div = document.createElement("div");
      div.className = "message";
      div.id = isUser ? "user" : "bot";
      div.innerHTML = `<span id="${isUser ? 'user-response' : 'bot-response'}">${content}</span>`;
      messageSection.appendChild(div);
      messageSection.scrollTop = messageSection.scrollHeight;
    }

    async function handleSend() {
      const userText = input.value.trim();
      if (!userText) return;
      addMessage(userText, true);
      input.value = "";
      addMessage("<span style='color:#999'>Thinking...</span>", false);
      try {
        const data = await askOpenRouter(userText);
        messageSection.lastChild.remove();
        const reply = (data && data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content)
          ? data.choices[0].message.content
          : (data && data.error ? (data.error.message || JSON.stringify(data.error)) : "No response");
        addMessage(reply, false);
      } catch (_e) {
        messageSection.lastChild.remove();
        addMessage("Sorry, there was an error.", false);
      }
    }

    sendBtn.onclick = handleSend;
    input.addEventListener("keydown", function(e) {
      if (e.key === "Enter") handleSend();
    });

