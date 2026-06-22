function renderChatMessages() {
  const container = document.getElementById("chat-messages-container");
  container.innerHTML = "";
  appState.chatMessages.forEach(msg => {
    const isMe = msg.sender === "You";
    const row = document.createElement("div");
    row.className = `chat-msg-row ${isMe ? 'me' : ''}`;
    row.innerHTML = `
      <div class="chat-msg-meta">
        ${isMe ? `<span>${msg.time}</span><strong>${msg.sender}</strong>` : `<strong>${msg.sender}</strong><span>${msg.time}</span>`}
      </div>
      <div class="chat-msg-bubble">${msg.text}</div>
    `;
    container.appendChild(row);
  });
  container.scrollTop = container.scrollHeight;
}

function triggerChatReply(userMessage) {
  const typingIndicator = document.getElementById("chat-typing-indicator");
  const typingText = document.getElementById("chat-typing-text");
  typingIndicator.style.display = "flex";
  const teamBots = [
    { name: "Aria Chen", role: "Backend Engineer" },
    { name: "Max Kowalski", role: "UI/UX Designer" }
  ];
  const selectedBot = teamBots[Math.floor(Math.random() * teamBots.length)];
  typingText.textContent = `${selectedBot.name} is typing...`;
  let replyText = "Awesome! Let's keep compiling modules.";
  const q = userMessage.toLowerCase();
  if (q.includes("sync") || q.includes("parcel")) {
    replyText = `I see we have ${appState.parcels.length} parcels synced on the gateway. Let me know when you run the next Parcle Data Sync!`;
  } else if (q.includes("task") || q.includes("todo") || q.includes("kanban") || q.includes("done")) {
    const pending = appState.tasks.filter(t => t.status !== "completed").length;
    replyText = pending > 0 ? `Still got ${pending} tasks on our sprint backlog. I can jump on the next Frontend module.` : "All tasks are marked completed! Superb velocity, let's deploy!";
  } else if (q.includes("deploy") || q.includes("staging") || q.includes("production")) {
    if (appState.team.hasDeployedProd) {
      replyText = "The production build is active on Enter Pro edge routers! Ready to submit our final pitch?";
    } else {
      replyText = "We should double check the staging sandbox route first before locking in the production build.";
    }
  } else if (q.includes("hello") || q.includes("hey") || q.includes("hi")) {
    replyText = `Hey there! Ready to crush this hackathon project. What's our next milestone?`;
  } else if (q.includes("badge") || q.includes("achievement") || q.includes("points")) {
    replyText = `Our standing is looking solid! We are ranked #${appState.team.rank} on the leaderboard. Let's aim for #1.`;
  }
  setTimeout(() => {
    typingIndicator.style.display = "none";
    const now = new Date();
    const timeStr = now.toTimeString().split(" ")[0].substring(0, 5);
    appState.chatMessages.push({ sender: selectedBot.name, text: replyText, time: timeStr, type: "received" });
    const chatDrawer = document.getElementById("chat-drawer");
    if (!chatDrawer.classList.contains("active")) {
      document.getElementById("chat-notif-dot").style.display = "inline-block";
      showToast(`New message from ${selectedBot.name}`, "info");
    }
    saveData();
    renderChatMessages();
  }, 1500 + Math.random() * 1000);
}

setInterval(() => {
  const chatDrawer = document.getElementById("chat-drawer");
  if (appState.chatMessages) {
    const teamBots = [
      { name: "Aria Chen", text: "Just reviewed the compiler scripts, looks stable." },
      { name: "Max Kowalski", text: "Don't forget to sync our delta using Parcle before deadlines!" }
    ];
    const item = teamBots[Math.floor(Math.random() * teamBots.length)];
    const now = new Date();
    const timeStr = now.toTimeString().split(" ")[0].substring(0, 5);
    appState.chatMessages.push({ sender: item.name, text: item.text, time: timeStr, type: "received" });
    if (!chatDrawer.classList.contains("active")) {
      const dot = document.getElementById("chat-notif-dot");
      if (dot) dot.style.display = "inline-block";
      showToast(`New collaboration message in chat`, "info");
    }
    saveData();
    renderChatMessages();
  }
}, 50000);
