export const showNotification = (iconURL, messageText, position) => {
  // Load the Google Font for Open Sans.
  const fontLink = document.createElement("link");
  fontLink.href = "https://fonts.googleapis.com/css2?family=Open+Sans:wght@400&display=swap";
  fontLink.rel = "stylesheet";
  document.head.appendChild(fontLink);

  // Create the modal container.
  const modal = document.createElement("div");
  modal.id = "tineye-notification-modal";

  // Create the icon using the passed iconURL.
  const icon = document.createElement("img");
  icon.src = iconURL;
  icon.alt = "TinEye Icon";
  icon.style.width = "20px";
  icon.style.height = "20px";
  icon.style.marginRight = "10px";
  icon.style.position = "static";

  // Create the message text.
  const message = document.createElement("span");
  message.textContent = messageText;

  // Append icon and message to the modal.
  modal.appendChild(icon);
  modal.appendChild(message);

  // Set styles based on position.
  const modalStyle = {
    position: "fixed",
    backgroundColor: "#fff",
    color: "#303a46",
    padding: "20px 20px",
    borderRadius: "12px",
    border: "1px solid #303a46",
    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.3)",
    zIndex: "10000",
    transition: "opacity 0.5s, transform 0.3s",
    opacity: "0",
    display: "flex",
    alignItems: "center",
    fontFamily: "'Open Sans', sans-serif",
    fontSize: "16px",
    letterSpacing: "0.25px",
  };

  // Adjust position properties based on the argument.
  if (position === "top-right") {
    Object.assign(modalStyle, { top: "10px", right: "10px" });
  } else if (position === "bottom") {
    Object.assign(modalStyle, { bottom: "20px", left: "50%", transform: "translateX(-50%)" });
  }

  // Apply the final styles to the modal.
  Object.assign(modal.style, modalStyle);

  // Add the modal to the document.
  document.body.appendChild(modal);

  // Animate modal appearance.
  requestAnimationFrame(() => {
    modal.style.opacity = "1";
  });

  // Fade out and remove the modal.
  setTimeout(() => {
    modal.style.opacity = "0";
    setTimeout(() => modal.remove(), 500);
  }, 3000);
};
