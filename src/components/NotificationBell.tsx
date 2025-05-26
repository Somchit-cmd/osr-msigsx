import { useEffect, useState, useRef } from "react";
import { db } from "@/lib/firebase";
import { collection, query, where, onSnapshot, orderBy, updateDoc, doc } from "firebase/firestore";
import { Bell, CheckCircle, XCircle, PackageCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from 'react-i18next';

export default function NotificationBell({ userId }) {
  const { t } = useTranslation();
  const [notifications, setNotifications] = useState([]);
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const dropdownRef = useRef(null);

  useEffect(() => {
    const q = query(
      collection(db, "notifications"),
      where("userId", "==", userId),
      orderBy("createdAt", "desc")
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const notifs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      console.log("Notifications for", userId, notifs);
      setNotifications(notifs);
    });
    return () => unsubscribe();
  }, [userId]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAllAsRead = async () => {
    notifications.filter(n => !n.read).forEach(async (n) => {
      await updateDoc(doc(db, "notifications", n.id), { read: true });
    });
  };

  const getIcon = (type) => {
    switch (type) {
      case "new_request":
        return <Bell size={18} color="#5457F6" style={{ marginRight: 8 }} />;
      case "request_approved":
        return <CheckCircle size={18} color="#22c55e" style={{ marginRight: 8 }} />;
      case "request_rejected":
        return <XCircle size={18} color="#ef4444" style={{ marginRight: 8 }} />;
      case "request_fulfilled":
        return <PackageCheck size={18} color="#0ea5e9" style={{ marginRight: 8 }} />;
      default:
        return <Bell size={18} color="#5457F6" style={{ marginRight: 8 }} />;
    }
  };

  return (
    <div style={{ position: "relative", display: "inline-block" }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          background: "white",
          border: "none",
          borderRadius: "12px",
          padding: "8px 12px",
          marginRight: "12px",
          display: "flex",
          alignItems: "center",
          boxShadow: open ? "0 2px 8px rgba(0,0,0,0.08)" : "none",
          transition: "background 0.2s, box-shadow 0.2s",
          cursor: "pointer"
        }}
        onMouseOver={e => e.currentTarget.style.background = "#f0f4fa"}
        onMouseOut={e => e.currentTarget.style.background = "white"}
        title={t('notifications.title')}
      >
        <Bell size={22} color="#5457F6" />
        {unreadCount > 0 && (
          <span style={{
            marginLeft: 4,
            background: "#ef4444",
            color: "white",
            borderRadius: "50%",
            padding: "2px 7px",
            fontSize: "12px",
            fontWeight: "bold"
          }}>{unreadCount}</span>
        )}
      </button>
      {open && (
        <div
          ref={dropdownRef}
          style={{
            position: "absolute",
            right: 0,
            background: "white",
            border: "1px solid #ccc",
            borderRadius: "8px",
            width: "340px",
            maxHeight: "400px",
            overflowY: "auto",
            zIndex: 100,
            boxShadow: "0 4px 24px rgba(0,0,0,0.12)",
            marginTop: "8px"
          }}
        >
          <div style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "14px 18px",
            borderBottom: "1px solid #eee",
            fontWeight: "bold",
            fontSize: "16px",
            background: "#f5f7fa",
            borderTopLeftRadius: "8px",
            borderTopRightRadius: "8px",
            color: "#5457F6"
          }}>
            <span>{t('notifications.title')}</span>
            <button
              onClick={markAllAsRead}
              style={{
                background: "none",
                border: "none",
                color: "#5457F6",
                fontWeight: "normal",
                cursor: "pointer",
                fontSize: "13px"
              }}
              title={t('notifications.markAllRead')}
            >
              {t('notifications.markAllRead')}
            </button>
          </div>
          {notifications.filter(n => !n.read).length === 0 ? (
            <div style={{ padding: "24px", textAlign: "center", color: "#888" }}>
              {t('notifications.noUnread')}
            </div>
          ) : (
            notifications
              .filter(n => !n.read)
              .slice(0, 10)
              .map(n => (
                <div
                  key={n.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    padding: "14px 18px",
                    borderBottom: "1px solid #f0f0f0",
                    fontWeight: n.read ? "normal" : "bold",
                    background: n.read ? "#fff" : "#eaf3ff",
                    color: "#222",
                    cursor: "pointer",
                    transition: "background 0.2s",
                    position: "relative"
                  }}
                  onClick={() => {
                    navigate("/admin/requests");
                    markAllAsRead();
                  }}
                  onMouseOver={e => e.currentTarget.style.background = "#f0f4fa"}
                  onMouseOut={e => e.currentTarget.style.background = n.read ? "#fff" : "#eaf3ff"}
                >
                  {getIcon(n.type)}
                  <span style={{ flex: 1 }}>{n.message || n.id}</span>
                  {!n.read && (
                    <span style={{
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      background: "#5457F6",
                      display: "inline-block",
                      marginLeft: 8
                    }} />
                  )}
                </div>
              ))
          )}
        </div>
      )}
    </div>
  );
}
