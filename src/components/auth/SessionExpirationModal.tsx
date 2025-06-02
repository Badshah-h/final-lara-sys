import React, { useState, useEffect } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useAuth } from "@/contexts/AuthContext";
import { authService } from "@/services/auth/authService";

// How many minutes of inactivity before showing warning
const INACTIVITY_WARNING = 25; // 25 minutes
const SESSION_TIMEOUT = 30; // 30 minutes

const SessionExpirationModal = () => {
  const [open, setOpen] = useState(false);
  const [minutesLeft, setMinutesLeft] = useState(0);
  const { user, logout } = useAuth();
  const [lastActivity, setLastActivity] = useState(Date.now());

  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    // Track user activity
    const updateActivity = () => {
      setLastActivity(Date.now());
    };

    // Add event listeners for user activity
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    events.forEach(event => {
      document.addEventListener(event, updateActivity, true);
    });

    const checkSessionExpiration = async () => {
      // Only check if user is logged in
      if (!user) return;

      const currentTime = Date.now();
      const inactiveTime = Math.floor((currentTime - lastActivity) / (1000 * 60)); // minutes

      // If within warning threshold, show dialog
      if (inactiveTime >= INACTIVITY_WARNING && inactiveTime < SESSION_TIMEOUT) {
        const timeLeft = SESSION_TIMEOUT - inactiveTime;
        setMinutesLeft(timeLeft);
        setOpen(true);
      } else if (inactiveTime >= SESSION_TIMEOUT) {
        // Session expired due to inactivity
        try {
          // Check if session is still valid on server
          const isAuthenticated = await authService.isAuthenticated();
          if (!isAuthenticated) {
            logout();
          } else {
            // Reset activity if server session is still valid
            setLastActivity(Date.now());
          }
        } catch (error) {
          // If we can't check, assume session expired
          logout();
        }
      }
    };

    // Initial check
    checkSessionExpiration();

    // Set up interval to check session expiration
    intervalId = setInterval(() => {
      checkSessionExpiration();

      // Update countdown if modal is open
      if (open) {
        const currentTime = Date.now();
        const inactiveTime = Math.floor((currentTime - lastActivity) / (1000 * 60));
        const timeLeft = Math.max(0, SESSION_TIMEOUT - inactiveTime);
        setMinutesLeft(timeLeft);

        if (timeLeft <= 0) {
          logout();
          setOpen(false);
        }
      }
    }, 60000); // Check every minute

    return () => {
      clearInterval(intervalId);
      events.forEach(event => {
        document.removeEventListener(event, updateActivity, true);
      });
    };
  }, [user, logout, open, lastActivity]);

  const handleStayLoggedIn = () => {
    // Reset activity timer
    setLastActivity(Date.now());
    setOpen(false);
  };

  const handleLogout = () => {
    logout();
    setOpen(false);
  };

  // Format minutes
  const formatTime = (minutes: number) => {
    if (minutes <= 1) {
      return "less than 1 minute";
    }
    return `${minutes} minute${minutes !== 1 ? 's' : ''}`;
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Your session is about to expire</AlertDialogTitle>
          <AlertDialogDescription>
            Due to inactivity, your session will expire in {formatTime(minutesLeft)}.
            Do you want to stay logged in?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={handleLogout}>Logout</AlertDialogCancel>
          <AlertDialogAction onClick={handleStayLoggedIn}>Stay logged in</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default SessionExpirationModal;
