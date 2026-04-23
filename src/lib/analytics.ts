import { db } from "./firebase";
import { collection, addDoc, serverTimestamp, doc, setDoc, increment } from "firebase/firestore";

export type EventType = 'page_view' | 'video_generated' | 'template_preview' | 'login' | 'signup' | 'render_view';

export async function trackEvent(type: EventType, metadata: Record<string, any> = {}) {
  try {
    const date = new Date();
    const dateId = date.toISOString().split('T')[0]; // YYYY-MM-DD
    
    // 1. Log detailed event for raw analysis
    await addDoc(collection(db, "analytics_logs"), {
      type,
      timestamp: serverTimestamp(),
      ...metadata,
      userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : 'server',
      path: typeof window !== 'undefined' ? window.location.pathname : 'server',
    });

    // 2. Increment daily counters for fast dashboard rendering
    const statsDocRef = doc(db, "analytics_daily_stats", dateId);
    
    // We update specific counters based on type
    const updateData: Record<string, any> = {
      lastUpdated: serverTimestamp(),
    };

    if (type === 'page_view') {
      const path = metadata.path || (typeof window !== 'undefined' ? window.location.pathname : 'root');
      if (path === '/') updateData.home_visits = increment(1);
      else if (path.includes('dashboard')) updateData.dashboard_visits = increment(1);
      else updateData.other_visits = increment(1);
      updateData.total_visits = increment(1);
    } else if (type === 'video_generated') {
      updateData.videos_generated = increment(1);
    } else if (type === 'render_view') {
      updateData.render_views = increment(1);
    } else if (type === 'login') {
      updateData.logins = increment(1);
    }

    await setDoc(statsDocRef, updateData, { merge: true });

  } catch (error) {
    console.error("Error tracking event:", error);
  }
}
