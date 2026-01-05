import React, { useState, useEffect, useRef } from "react";
import "./App.css";

// Helper to format date and time
const formatDate = () => {
  const dateObj = new Date();
  const date = dateObj.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
  const time = dateObj.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
  return { date, time };
};

// Helper to get initials
const getInitials = (name) => {
  if (!name) return "";
  return name
    .split(" ")
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase();
};

const App = () => {
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [notes, setNotes] = useState([]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [currentNote, setCurrentNote] = useState("");

  const modalRef = useRef();

  // Load data
  useEffect(() => {
    const savedGroups = localStorage.getItem("groups");
    const savedNotes = localStorage.getItem("notes");
    if (savedGroups) setGroups(JSON.parse(savedGroups));
    if (savedNotes) setNotes(JSON.parse(savedNotes));
  }, []);

  // Save data
  useEffect(() => {
    localStorage.setItem("groups", JSON.stringify(groups));
    localStorage.setItem("notes", JSON.stringify(notes));
  }, [groups, notes]);

  // Create group
  const handleCreateGroup = () => {
    if (!groupName || !selectedColor) return;

    if (groups.some(g => g.name.toLowerCase() === groupName.toLowerCase())) {
      alert("Group name already exists!");
      return;
    }

    setGroups([
      ...groups,
      { id: Date.now(), name: groupName, color: selectedColor },
    ]);

    setIsModalOpen(false);
    setGroupName("");
    setSelectedColor("");
  };

  // Add note
  const handleAddNote = () => {
    if (!currentNote.trim() || !selectedGroup) return;

    const { date, time } = formatDate();

    setNotes([
      ...notes,
      {
        id: Date.now(),
        groupId: selectedGroup.id,
        content: currentNote,
        date,
        time,
      },
    ]);

    setCurrentNote("");
  };

  // Enter key
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleAddNote();
    }
  };

  // Close modal
  const closeModal = (e) => {
    if (modalRef.current === e.target) setIsModalOpen(false);
  };

  return (
    <div className="app-container">
      {/* SIDEBAR */}
      <div className="sidebar">
        <h2>Pocket Notes</h2>

        <div className="group-list">
          {groups.map((group) => (
            <div
              key={group.id}
              className={`group-item ${
                selectedGroup?.id === group.id ? "active" : ""
              }`}
              onClick={() => setSelectedGroup(group)}
            >
              <div
                className="group-icon"
                style={{ backgroundColor: group.color }}
              >
                {getInitials(group.name)}
              </div>
              <span>{group.name}</span>
            </div>
          ))}
        </div>

        <button className="create-btn" onClick={() => setIsModalOpen(true)}>
          +
        </button>
      </div>

      {/* MAIN CONTENT */}
      <div className="main-content">
        {selectedGroup ? (
          <>
            <div className="header">
              <div
                className="group-icon"
                style={{ backgroundColor: selectedGroup.color }}
              >
                {getInitials(selectedGroup.name)}
              </div>
              <h3>{selectedGroup.name}</h3>
            </div>

            <div className="notes-display">
              {notes
                .filter((n) => n.groupId === selectedGroup.id)
                .map((note) => (
                  <div key={note.id} className="note-card">
                    <p>{note.content}</p>
                    <div className="note-meta">
                      {note.date} • {note.time}
                    </div>
                  </div>
                ))}
            </div>

            <div className="input-area">
              <textarea
                placeholder="Enter your text here..."
                value={currentNote}
                onChange={(e) => setCurrentNote(e.target.value)}
                onKeyDown={handleKeyDown}
              />
              <button
                className="send-btn"
                disabled={!currentNote.trim()}
                onClick={handleAddNote}
                style={{
                  color: currentNote.trim() ? "#001F8B" : "#ababab",
                }}
              >
                ➤
              </button>
            </div>
          </>
        ) : (
          <div className="empty-state">
            <h1>Pocket Notes</h1>
            <p>
              Send and receive messages without keeping your phone online.
              <br />
              Use Pocket Notes on up to 4 linked devices and 1 mobile phone.
            </p>
            <div className="lock-msg">🔒 end-to-end encrypted</div>
          </div>
        )}
      </div>

      {/* MODAL */}
      {isModalOpen && (
        <div className="modal-overlay" ref={modalRef} onClick={closeModal}>
          <div className="modal-content">
            <h3>Create New Group</h3>

            <div className="modal-row">
              <label>Group Name</label>
              <input
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
              />
            </div>

            <div className="modal-row">
              <label>Choose colour</label>
              <div className="color-options">
                {[
                  "#B38BFA",
                  "#FF79F2",
                  "#43E6FC",
                  "#F19576",
                  "#0047FF",
                  "#6691FF",
                ].map((color) => (
                  <div
                    key={color}
                    className={`color-circle ${
                      selectedColor === color ? "selected" : ""
                    }`}
                    style={{ backgroundColor: color }}
                    onClick={() => setSelectedColor(color)}
                  />
                ))}
              </div>
            </div>

            <button className="create-group-btn" onClick={handleCreateGroup}>
              Create
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
