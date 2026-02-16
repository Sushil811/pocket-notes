import React, { useState, useEffect } from "react";
import "./App.css";

function App() {
  // --- 1. STATE MANAGEMENT ---

  // Lazy initialize groups from LocalStorage
  const [groups, setGroups] = useState(() => {
    const saved = localStorage.getItem("pocketNotesGroups");
    return saved ? JSON.parse(saved) : [];
  });

  // Lazy initialize notes from LocalStorage
  const [notes, setNotes] = useState(() => {
    const saved = localStorage.getItem("pocketNotesData");
    return saved ? JSON.parse(saved) : [];
  });

  // UI State
  const [selectedGroupId, setSelectedGroupId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMobileView, setIsMobileView] = useState(window.innerWidth < 768);

  // Form State
  const [newGroupName, setNewGroupName] = useState("");
  const [newGroupColor, setNewGroupColor] = useState("#B38BFA");
  const [currentNote, setCurrentNote] = useState("");

  // --- 2. EFFECTS ---

  // Persist data whenever groups or notes change
  useEffect(() => {
    localStorage.setItem("pocketNotesGroups", JSON.stringify(groups));
    localStorage.setItem("pocketNotesData", JSON.stringify(notes));
  }, [groups, notes]);

  // Handle Window Resize (Desktop vs Mobile)
  useEffect(() => {
    const handleResize = () => {
      setIsMobileView(window.innerWidth < 768);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // --- 3. HELPER FUNCTIONS ---

  const getInitials = (name) => {
    if (!name) return "";
    const words = name.trim().split(" ");
    if (words.length === 1) return name.substring(0, 2).toUpperCase();
    return (words[0][0] + words[1][0]).toUpperCase();
  };

  const formatDate = () => {
    const date = new Date();
    const dateOptions = { day: "numeric", month: "short", year: "numeric" };
    const timeOptions = { hour: "2-digit", minute: "2-digit", hour12: true };
    return {
      date: date.toLocaleDateString("en-GB", dateOptions),
      time: date.toLocaleTimeString("en-US", timeOptions),
    };
  };

  // --- 4. HANDLERS ---

  const handleCreateGroup = () => {
    if (!newGroupName || newGroupName.trim().length < 2) {
      alert("Group name must be at least 2 characters long.");
      return;
    }

    // Check for duplicates
    const isDuplicate = groups.some(
      (g) => g.name.toLowerCase() === newGroupName.trim().toLowerCase()
    );

    if (isDuplicate) {
      alert("This group name already exists.");
      return;
    }

    const newGroup = {
      id: Date.now().toString(),
      name: newGroupName.trim(),
      color: newGroupColor,
      initials: getInitials(newGroupName),
    };

    setGroups([...groups, newGroup]);
    setNewGroupName("");
    setIsModalOpen(false);
  };

  const handleSaveNote = () => {
    if (!currentNote.trim()) return;

    const { date, time } = formatDate();

    const newNote = {
      id: Date.now(),
      groupId: selectedGroupId,
      content: currentNote,
      createdDate: date,
      createdTime: time,
    };

    setNotes([...notes, newNote]);
    setCurrentNote("");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSaveNote();
    }
  };

  // Get active data
  const activeGroup = groups.find((g) => g.id === selectedGroupId);
  const activeNotes = notes.filter((n) => n.groupId === selectedGroupId);

  return (
    <div className="app-container">
      {/* --- SIDEBAR --- */}
      {/* Hide Sidebar on Mobile if a group is selected */}
      <div
        className={`sidebar ${isMobileView && selectedGroupId ? "hidden" : ""}`}
      >
        <h2 className="sidebar-title">Pocket Notes</h2>

        <div className="group-list">
          {groups.map((group) => (
            <div
              key={group.id}
              className={`group-item ${
                selectedGroupId === group.id ? "active" : ""
              }`}
              onClick={() => setSelectedGroupId(group.id)}
            >
              <div
                className="group-icon"
                style={{ backgroundColor: group.color }}
              >
                {group.initials}
              </div>
              <span className="group-name">{group.name}</span>
            </div>
          ))}
        </div>

        <button
          className="create-group-btn"
          onClick={() => setIsModalOpen(true)}
        >
          +
        </button>
      </div>

      {/* --- MESSAGE AREA --- */}
      {/* Hide Message Area on Mobile if NO group is selected */}
      <div
        className={`message-area ${
          isMobileView && !selectedGroupId ? "hidden" : ""
        }`}
      >
        {selectedGroupId ? (
          <>
            <div className="chat-header">
              <button
                className="back-btn"
                onClick={() => setSelectedGroupId(null)}
              >
                ←
              </button>
              <div
                className="group-icon header-icon"
                style={{ backgroundColor: activeGroup?.color }}
              >
                {activeGroup?.initials}
              </div>
              <span className="header-title">{activeGroup?.name}</span>
            </div>

            <div className="notes-display">
              {activeNotes.map((note) => (
                <div key={note.id} className="note-card">
                  <p>{note.content}</p>
                  <div className="note-meta">
                    {note.createdDate} • {note.createdTime}
                  </div>
                </div>
              ))}
            </div>

            <div className="input-container">
              <div className="input-box-wrapper">
                <textarea
                  placeholder="Enter your text here..."
                  value={currentNote}
                  onChange={(e) => setCurrentNote(e.target.value)}
                  onKeyDown={handleKeyDown}
                />
                <button
                  className="send-btn"
                  onClick={handleSaveNote}
                  disabled={!currentNote.trim()}
                  style={{ color: currentNote.trim() ? "#001F8B" : "#ABABAB" }}
                >
                  ➤
                </button>
              </div>
            </div>
          </>
        ) : (
          /* Empty State */
          <div className="empty-state">
            <div className="empty-image">
              <img
                src="https://image.notion-so.com/front/notion-loading-2.png"
                alt="Pocket Notes"
              />
            </div>
            <h1>Pocket Notes</h1>
            <p>
              Send and receive messages without keeping your phone online.
              <br />
              Use Pocket Notes on up to 4 linked devices and 1 mobile phone.
            </p>
            <div className="footer-encryption">🔒 end-to-end encrypted</div>
          </div>
        )}
      </div>

      {/* --- MODAL --- */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Create New Group</h3>

            <div className="form-row">
              <label>Group Name</label>
              <input
                type="text"
                placeholder="Enter group name"
                value={newGroupName}
                onChange={(e) => setNewGroupName(e.target.value)}
              />
            </div>

            <div className="form-row">
              <label>Choose colour</label>
              <div className="color-picker">
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
                      newGroupColor === color ? "selected" : ""
                    }`}
                    style={{ backgroundColor: color }}
                    onClick={() => setNewGroupColor(color)}
                  />
                ))}
              </div>
            </div>

            <button className="submit-create-btn" onClick={handleCreateGroup}>
              Create
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;