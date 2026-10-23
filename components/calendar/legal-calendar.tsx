"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "@/lib/i18n/context";
import {
  CalendarEvent,
  LegalEventType,
  CalendarPriority,
  LegalMatter,
} from "@/lib/portal/types";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Plus,
  Search,
  Clock,
  MapPin,
  Video,
  AlertCircle,
  Scale,
  ShieldCheck,
  User,
  Trash2,
  Edit3,
  X,
  ExternalLink,
  Bell,
  RefreshCw,
} from "lucide-react";

interface LegalCalendarProps {
  role?: "lawyer" | "client";
  userId?: string;
  initialEvents?: CalendarEvent[];
  matters?: LegalMatter[];
  onSelectEvent?: (event: CalendarEvent) => void;
}

type CalendarViewMode = "month" | "week" | "day" | "agenda";

const EVENT_TYPE_COLORS: Record<LegalEventType, { bg: string; text: string; border: string; badge: string }> = {
  hearing: {
    bg: "bg-purple-50",
    text: "text-purple-900",
    border: "border-purple-200",
    badge: "bg-purple-100 text-purple-800",
  },
  consultation: {
    bg: "bg-emerald-50",
    text: "text-emerald-900",
    border: "border-emerald-200",
    badge: "bg-emerald-100 text-emerald-800",
  },
  meeting: {
    bg: "bg-blue-50",
    text: "text-blue-900",
    border: "border-blue-200",
    badge: "bg-blue-100 text-blue-800",
  },
  deadline: {
    bg: "bg-red-50",
    text: "text-red-900",
    border: "border-red-200",
    badge: "bg-red-100 text-red-800",
  },
  filing: {
    bg: "bg-amber-50",
    text: "text-amber-900",
    border: "border-amber-200",
    badge: "bg-amber-100 text-amber-800",
  },
  task: {
    bg: "bg-teal-50",
    text: "text-teal-900",
    border: "border-teal-200",
    badge: "bg-teal-100 text-teal-800",
  },
  reminder: {
    bg: "bg-stone-50",
    text: "text-stone-800",
    border: "border-stone-200",
    badge: "bg-stone-100 text-stone-700",
  },
};

const PRIORITY_BADGES: Record<CalendarPriority, { label: string; hiLabel: string; color: string }> = {
  low: { label: "Low", hiLabel: "सामान्य", color: "text-stone-600 bg-stone-100" },
  medium: { label: "Medium", hiLabel: "मध्यम", color: "text-blue-700 bg-blue-100" },
  high: { label: "High", hiLabel: "उच्च", color: "text-amber-800 bg-amber-100" },
  urgent: { label: "Urgent", hiLabel: "अति आवश्यक", color: "text-red-800 bg-red-100 font-bold animate-pulse" },
};

/**
 * Asia/Kolkata (IST: UTC+05:30) timezone helpers.
 * Prevents UTC day-shift bugs when working with date strings in Indian legal calendar.
 */
export function getISTDateString(d: Date | string | number): string {
  const dateObj = typeof d === "object" ? d : new Date(d);
  if (isNaN(dateObj.getTime())) return "";
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(dateObj);
}

export function getISTTimeString(d: Date | string | number): string {
  const dateObj = typeof d === "object" ? d : new Date(d);
  if (isNaN(dateObj.getTime())) return "10:30";
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Kolkata",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(dateObj);
}

export function LegalCalendar({
  role = "lawyer",
  initialEvents = [],
  matters = [],
}: LegalCalendarProps) {
  const { t, isHindi, locale } = useLanguage();

  const [events, setEvents] = useState<CalendarEvent[]>(initialEvents);
  const [isLoading, setIsLoading] = useState(false);
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [viewMode, setViewMode] = useState<CalendarViewMode>("month");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<string>("all");
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);

  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [errorFeedback, setErrorFeedback] = useState<string | null>(null);

  // Form states for creating/editing
  const [formTitle, setFormTitle] = useState("");
  const [formType, setFormType] = useState<LegalEventType>("hearing");
  const [formStartDate, setFormStartDate] = useState(() => getISTDateString(new Date()));
  const [formStartTime, setFormStartTime] = useState("10:30");
  const [formEndDate, setFormEndDate] = useState(() => getISTDateString(new Date()));
  const [formEndTime, setFormEndTime] = useState("11:30");
  const [formIsAllDay, setFormIsAllDay] = useState(false);
  const [formMatterId, setFormMatterId] = useState("");
  const [formAssociatedName, setFormAssociatedName] = useState("");
  const [formLocation, setFormLocation] = useState("");
  const [formMeetingLink, setFormMeetingLink] = useState("");
  const [formNotes, setFormNotes] = useState("");
  const [formPriority, setFormPriority] = useState<CalendarPriority>("medium");
  const [formReminderMinutes, setFormReminderMinutes] = useState(60);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Lock body scroll and register Escape key when modal is open
  useEffect(() => {
    if (isCreateModalOpen || isEditModalOpen) {
      document.body.classList.add("modal-open");
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape") {
          setIsCreateModalOpen(false);
          setIsEditModalOpen(false);
        }
      };
      window.addEventListener("keydown", handleKeyDown);
      return () => {
        document.body.classList.remove("modal-open");
        window.removeEventListener("keydown", handleKeyDown);
      };
    } else {
      document.body.classList.remove("modal-open");
    }
  }, [isCreateModalOpen, isEditModalOpen]);

  // Load events from API on mount
  const fetchEvents = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/calendar/events");
      if (res.ok) {
        const data = await res.json();
        if (data.events) {
          setEvents(data.events);
        }
      }
    } catch (err) {
      console.warn("[LegalCalendar] Error fetching events:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  // Formatters with Asia/Kolkata timezone
  const monthFormatter = useMemo(
    () =>
      new Intl.DateTimeFormat(locale === "hi" ? "hi-IN" : "en-IN", {
        month: "long",
        year: "numeric",
        timeZone: "Asia/Kolkata",
      }),
    [locale]
  );

  const dateFormatter = useMemo(
    () =>
      new Intl.DateTimeFormat(locale === "hi" ? "hi-IN" : "en-IN", {
        weekday: "short",
        day: "numeric",
        month: "short",
        year: "numeric",
        timeZone: "Asia/Kolkata",
      }),
    [locale]
  );

  const timeFormatter = useMemo(
    () =>
      new Intl.DateTimeFormat(locale === "hi" ? "hi-IN" : "en-IN", {
        hour: "numeric",
        minute: "numeric",
        hour12: true,
        timeZone: "Asia/Kolkata",
      }),
    [locale]
  );

  // Navigation actions
  const handlePrev = () => {
    const next = new Date(currentDate);
    if (viewMode === "month") next.setMonth(next.getMonth() - 1);
    else if (viewMode === "week") next.setDate(next.getDate() - 7);
    else next.setDate(next.getDate() - 1);
    setCurrentDate(next);
  };

  const handleNext = () => {
    const next = new Date(currentDate);
    if (viewMode === "month") next.setMonth(next.getMonth() + 1);
    else if (viewMode === "week") next.setDate(next.getDate() + 7);
    else next.setDate(next.getDate() + 1);
    setCurrentDate(next);
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  // Filtered Events
  const filteredEvents = useMemo(() => {
    return events.filter((e) => {
      if (selectedTypeFilter !== "all" && e.event_type !== selectedTypeFilter) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = e.title.toLowerCase().includes(q);
        const matchNotes = e.notes ? e.notes.toLowerCase().includes(q) : false;
        const matchAssoc = e.associated_name ? e.associated_name.toLowerCase().includes(q) : false;
        const matchLoc = e.location ? e.location.toLowerCase().includes(q) : false;
        if (!matchTitle && !matchNotes && !matchAssoc && !matchLoc) {
          return false;
        }
      }
      return true;
    });
  }, [events, selectedTypeFilter, searchQuery]);

  // Open modal pre-filling clicked date
  const handleOpenCreateForDate = (dateStr: string) => {
    setFormTitle("");
    setFormType("hearing");
    setFormStartDate(dateStr);
    setFormStartTime("10:30");
    setFormEndDate(dateStr);
    setFormEndTime("11:30");
    setFormIsAllDay(false);
    setFormMatterId(matters[0]?.id || "");
    setFormAssociatedName("");
    setFormLocation("");
    setFormMeetingLink("");
    setFormNotes("");
    setFormPriority("medium");
    setFormReminderMinutes(60);
    setErrorFeedback(null);
    setIsCreateModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (event: CalendarEvent) => {
    const startDateObj = new Date(event.start_time);
    const endDateObj = event.end_time ? new Date(event.end_time) : startDateObj;

    setFormTitle(event.title);
    setFormType(event.event_type);
    setFormStartDate(getISTDateString(startDateObj));
    setFormStartTime(getISTTimeString(startDateObj));
    setFormEndDate(getISTDateString(endDateObj));
    setFormEndTime(getISTTimeString(endDateObj));
    setFormIsAllDay(Boolean(event.is_all_day));
    setFormMatterId(event.matter_id || "");
    setFormAssociatedName(event.associated_name || "");
    setFormLocation(event.location || "");
    setFormMeetingLink(event.meeting_link || "");
    setFormNotes(event.notes || "");
    setFormPriority(event.priority);
    setFormReminderMinutes(event.reminder_minutes ?? 60);
    setErrorFeedback(null);
    setIsEditModalOpen(true);
  };

  // Submit Create
  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) {
      setErrorFeedback(isHindi ? "कृपया शीर्षक दर्ज करें" : "Title is required");
      return;
    }

    setIsSubmitting(true);
    setErrorFeedback(null);

    const startIso = formIsAllDay
      ? `${formStartDate}T00:00:00.000+05:30`
      : `${formStartDate}T${formStartTime}:00.000+05:30`;
    const endIso = formIsAllDay
      ? `${formEndDate}T23:59:59.000+05:30`
      : `${formEndDate}T${formEndTime}:00.000+05:30`;

    const payload = {
      title: formTitle.trim(),
      event_type: formType,
      start_time: startIso,
      end_time: endIso,
      is_all_day: formIsAllDay,
      matter_id: formMatterId || null,
      associated_name: formAssociatedName.trim() || null,
      location: formLocation.trim() || null,
      meeting_link: formMeetingLink.trim() || null,
      notes: formNotes.trim() || null,
      priority: formPriority,
      status: "scheduled",
      reminder_minutes: formReminderMinutes,
      is_court_verified: false,
    };

    try {
      const res = await fetch("/api/calendar/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to create event");
      }

      setEvents((prev) => [...prev, data.event]);
      setIsCreateModalOpen(false);
      setSelectedEvent(data.event);
    } catch (err: unknown) {
      console.error("[Calendar Create Error]:", err);
      setErrorFeedback(err instanceof Error ? err.message : "Failed to create event");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Submit Edit
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEvent) return;

    setIsSubmitting(true);
    setErrorFeedback(null);

    const startIso = formIsAllDay
      ? `${formStartDate}T00:00:00.000+05:30`
      : `${formStartDate}T${formStartTime}:00.000+05:30`;
    const endIso = formIsAllDay
      ? `${formEndDate}T23:59:59.000+05:30`
      : `${formEndDate}T${formEndTime}:00.000+05:30`;

    const payload = {
      id: selectedEvent.id,
      title: formTitle.trim(),
      event_type: formType,
      start_time: startIso,
      end_time: endIso,
      is_all_day: formIsAllDay,
      matter_id: formMatterId || null,
      associated_name: formAssociatedName.trim() || null,
      location: formLocation.trim() || null,
      meeting_link: formMeetingLink.trim() || null,
      notes: formNotes.trim() || null,
      priority: formPriority,
      reminder_minutes: formReminderMinutes,
      is_court_verified: Boolean(selectedEvent.is_court_verified),
    };

    try {
      const res = await fetch("/api/calendar/events", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to update event");
      }

      setEvents((prev) =>
        prev.map((e) => (e.id === selectedEvent.id ? { ...e, ...data.event } : e))
      );
      setSelectedEvent(data.event);
      setIsEditModalOpen(false);
    } catch (err: unknown) {
      console.error("[Calendar Edit Error]:", err);
      setErrorFeedback(err instanceof Error ? err.message : "Failed to update event");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete Event
  const handleDeleteEvent = async (id: string) => {
    if (!window.confirm(isHindi ? "क्या आप वाकई इस ईवेंट को हटाना चाहते हैं?" : "Are you sure you want to delete this event?")) {
      return;
    }

    setIsDeleting(true);
    try {
      const res = await fetch(`/api/calendar/events?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setEvents((prev) => prev.filter((e) => e.id !== id));
        if (selectedEvent?.id === id) {
          setSelectedEvent(null);
        }
      }
    } catch (err) {
      console.error("[Calendar Delete Error]:", err);
    } finally {
      setIsDeleting(false);
    }
  };

  // Month Grid Calculation (Monday Week-Start)
  const monthDays = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    // First day of month
    const firstDay = new Date(year, month, 1);
    // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
    // Convert to Monday = 0: (day + 6) % 7
    const startOffset = (firstDay.getDay() + 6) % 7;

    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();

    const days: Array<{
      date: Date;
      isCurrentMonth: boolean;
      dateString: string;
      isToday: boolean;
    }> = [];

    const todayStr = getISTDateString(new Date());

    // Prev month days
    for (let i = startOffset - 1; i >= 0; i--) {
      const d = new Date(year, month - 1, daysInPrevMonth - i);
      const dateString = getISTDateString(d);
      days.push({
        date: d,
        isCurrentMonth: false,
        dateString,
        isToday: dateString === todayStr,
      });
    }

    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
      const d = new Date(year, month, i);
      const dateString = getISTDateString(d);
      days.push({
        date: d,
        isCurrentMonth: true,
        dateString,
        isToday: dateString === todayStr,
      });
    }

    // Next month filling to total multiple of 7
    const remaining = (7 - (days.length % 7)) % 7;
    for (let i = 1; i <= remaining; i++) {
      const d = new Date(year, month + 1, i);
      const dateString = getISTDateString(d);
      days.push({
        date: d,
        isCurrentMonth: false,
        dateString,
        isToday: dateString === todayStr,
      });
    }

    return days;
  }, [currentDate]);

  // Group events by date string (YYYY-MM-DD in IST)
  const eventsByDate = useMemo(() => {
    const map: Record<string, CalendarEvent[]> = {};
    filteredEvents.forEach((event) => {
      const dateStr = getISTDateString(event.start_time);
      if (!map[dateStr]) map[dateStr] = [];
      map[dateStr].push(event);
    });
    return map;
  }, [filteredEvents]);

  // Week Days Calculation (Monday Week-Start)
  const weekDays = useMemo(() => {
    const d = new Date(currentDate);
    const day = (d.getDay() + 6) % 7;
    const monday = new Date(d);
    monday.setDate(d.getDate() - day);

    const week: Date[] = [];
    for (let i = 0; i < 7; i++) {
      const wd = new Date(monday);
      wd.setDate(monday.getDate() + i);
      week.push(wd);
    }
    return week;
  }, [currentDate]);

  // Weekday Labels
  const weekDayLabels = isHindi
    ? ["सोम", "मंगल", "बुध", "गुरु", "शुक्र", "शनि", "रवि"]
    : ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  return (
    <div className="w-full space-y-6">
      {/* Top Workspace Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-[#D5E5D9]">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#205C43] animate-pulse" />
            <span className="font-mono text-xs uppercase tracking-wider text-[#205C43] font-semibold">
              {role === "lawyer"
                ? isHindi ? "अधिवक्ता चैंबर अनुसूची (IST)" : "Chamber Practice Schedule (IST)"
                : isHindi ? "मुवक्किल कॉज लिस्ट व परामर्श (IST)" : "Client Hearings & Consultations (IST)"}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif text-[#202824] font-normal tracking-tight mt-1">
            {role === "lawyer" ? t.calendar.title : t.calendar.clientTitle}
          </h1>
          <p className="text-xs sm:text-sm text-[#69736D] mt-0.5">
            {role === "lawyer" ? t.calendar.subtitle : t.calendar.clientSubtitle}
          </p>
        </div>

        {/* Action Controls: Refresh, New Event Button */}
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={fetchEvents}
            disabled={isLoading}
            className="p-2.5 rounded-xl border border-[#D5E5D9] bg-white text-[#69736D] hover:text-[#205C43] hover:border-[#205C43]/40 transition-colors shadow-xs"
            title={isHindi ? "ताज़ा करें" : "Refresh events"}
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin text-[#205C43]" : ""}`} />
          </button>

          <button
            type="button"
            onClick={() => handleOpenCreateForDate(getISTDateString(new Date()))}
            className="px-4 py-2.5 rounded-xl bg-[#205C43] hover:bg-[#174530] text-white text-xs sm:text-sm font-medium flex items-center gap-2 transition-all shadow-xs hover:shadow-md cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>{t.calendar.newEvent}</span>
          </button>
        </div>
      </div>

      {/* Control Bar: Date Navigator, View Switcher & Search */}
      <div className="bg-white rounded-2xl border border-[#D5E5D9] p-4 shadow-xs space-y-3 sm:space-y-0 sm:flex sm:items-center sm:justify-between gap-4">
        {/* Date Navigator */}
        <div className="flex items-center gap-2">
          <div className="flex items-center rounded-xl border border-[#D5E5D9] bg-[#F8FAF9] p-1">
            <button
              type="button"
              onClick={handlePrev}
              className="p-1.5 rounded-lg hover:bg-white text-[#69736D] hover:text-[#202824] transition-all"
              aria-label={t.calendar.previous}
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={handleToday}
              className="px-3 py-1 text-xs font-semibold rounded-lg hover:bg-white text-[#205C43] transition-all"
            >
              {t.calendar.today}
            </button>
            <button
              type="button"
              onClick={handleNext}
              className="p-1.5 rounded-lg hover:bg-white text-[#69736D] hover:text-[#202824] transition-all"
              aria-label={t.calendar.next}
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <span className="font-serif text-lg sm:text-xl font-normal text-[#202824] pl-2 capitalize">
            {monthFormatter.format(currentDate)}
          </span>
        </div>

        {/* View Switcher Pills */}
        <div className="flex items-center gap-1 bg-[#F8FAF9] p-1 rounded-xl border border-[#D5E5D9] shrink-0">
          {(["month", "week", "day", "agenda"] as CalendarViewMode[]).map((mode) => {
            const isActive = viewMode === mode;
            const labels: Record<CalendarViewMode, string> = {
              month: t.calendar.month,
              week: t.calendar.week,
              day: t.calendar.day,
              agenda: t.calendar.agenda,
            };
            return (
              <button
                key={mode}
                type="button"
                onClick={() => setViewMode(mode)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all capitalize ${
                  isActive
                    ? "bg-[#205C43] text-white shadow-xs font-semibold"
                    : "text-[#69736D] hover:text-[#202824]"
                }`}
              >
                {labels[mode]}
              </button>
            );
          })}
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-[#69736D] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={isHindi ? "शीर्षक, नोट्स या पक्षकार खोजें..." : "Search hearings, matters, clients..."}
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-[#D5E5D9] bg-white text-xs text-[#202824] placeholder-[#69736D] focus:outline-none focus:ring-1 focus:ring-[#205C43]"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#69736D] hover:text-[#202824]"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Type Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 text-xs">
          <button
            type="button"
            onClick={() => setSelectedTypeFilter("all")}
            className={`px-3 py-1.5 rounded-lg border whitespace-nowrap transition-all font-medium ${
              selectedTypeFilter === "all"
                ? "bg-[#205C43] text-white border-[#205C43]"
                : "bg-white text-[#69736D] border-[#D5E5D9] hover:border-[#205C43]/40"
            }`}
          >
            {t.common.all} ({events.length})
          </button>
          {(["hearing", "consultation", "deadline", "filing"] as LegalEventType[]).map((type) => {
            const count = events.filter((e) => e.event_type === type).length;
            const labels: Record<LegalEventType, string> = {
              hearing: t.calendar.hearing,
              consultation: t.calendar.consultation,
              meeting: t.calendar.meeting,
              deadline: t.calendar.deadline,
              filing: t.calendar.filing,
              task: t.calendar.task,
              reminder: t.calendar.reminder,
            };
            const isSel = selectedTypeFilter === type;
            return (
              <button
                key={type}
                type="button"
                onClick={() => setSelectedTypeFilter(type)}
                className={`px-3 py-1.5 rounded-lg border whitespace-nowrap transition-all font-medium flex items-center gap-1.5 ${
                  isSel
                    ? "bg-[#205C43] text-white border-[#205C43]"
                    : "bg-white text-[#69736D] border-[#D5E5D9] hover:border-[#205C43]/40"
                }`}
              >
                <span>{labels[type]}</span>
                <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${isSel ? "bg-white/20 text-white" : "bg-[#F0F4F1] text-[#69736D]"}`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Calendar Viewport */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        {/* Calendar Grid Container (3 cols on desktop) */}
        <div className="lg:col-span-3 bg-white rounded-2xl border border-[#D5E5D9] shadow-xs overflow-hidden">
          {/* VIEW 1: MONTH VIEW */}
          {viewMode === "month" && (
            <div className="w-full">
              {/* Day header row */}
              <div className="grid grid-cols-7 border-b border-[#D5E5D9] bg-[#F8FAF9] text-center text-xs font-mono font-semibold text-[#69736D] py-2.5">
                {weekDayLabels.map((lbl, idx) => (
                  <div key={idx} className={idx >= 5 ? "text-stone-400" : ""}>
                    {lbl}
                  </div>
                ))}
              </div>

              {/* Day cells */}
              <div className="grid grid-cols-7 auto-rows-fr divide-x divide-y divide-[#D5E5D9]/80 border-b border-[#D5E5D9]">
                {monthDays.map((dayItem, index) => {
                  const dayEvents = eventsByDate[dayItem.dateString] || [];
                  const isSelected = selectedEvent && getISTDateString(selectedEvent.start_time) === dayItem.dateString;

                  return (
                    <div
                      key={index}
                      onClick={() => handleOpenCreateForDate(dayItem.dateString)}
                      className={`min-h-[96px] sm:min-h-[110px] p-1.5 sm:p-2 transition-colors cursor-pointer group flex flex-col justify-between ${
                        !dayItem.isCurrentMonth
                          ? "bg-[#FDFEFC]/50 text-[#69736D]/50"
                          : "bg-white hover:bg-[#EAF3ED]/30"
                      } ${dayItem.isToday ? "bg-[#EAF3ED]/40" : ""} ${isSelected ? "ring-2 ring-inset ring-[#205C43]" : ""}`}
                    >
                      <div className="flex items-center justify-between">
                        <span
                          className={`text-xs font-mono w-6 h-6 rounded-full flex items-center justify-center font-semibold ${
                            dayItem.isToday
                              ? "bg-[#205C43] text-white shadow-xs"
                              : dayItem.isCurrentMonth
                              ? "text-[#202824]"
                              : "text-[#69736D]/60"
                          }`}
                        >
                          {dayItem.date.getDate()}
                        </span>
                        {dayEvents.length > 0 && (
                          <span className="font-mono text-[10px] px-1.5 py-0.2 rounded-full bg-[#EAF3ED] text-[#205C43] font-semibold border border-[#D5E5D9]">
                            {dayEvents.length}
                          </span>
                        )}
                      </div>

                      {/* Event Chips */}
                      <div className="space-y-1 my-1 overflow-hidden">
                        {dayEvents.slice(0, 2).map((ev) => {
                          const styling = EVENT_TYPE_COLORS[ev.event_type] || EVENT_TYPE_COLORS.hearing;
                          return (
                            <button
                              key={ev.id}
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedEvent(ev);
                              }}
                              className={`w-full text-left px-1.5 py-0.5 rounded text-[10px] truncate block border transition-all ${styling.bg} ${styling.text} ${styling.border} hover:shadow-xs`}
                              title={ev.title}
                            >
                              <div className="flex items-center gap-1">
                                {ev.is_court_verified && (
                                  <ShieldCheck className="w-2.5 h-2.5 text-purple-700 shrink-0" />
                                )}
                                <span className="font-semibold truncate">{ev.title}</span>
                              </div>
                            </button>
                          );
                        })}
                        {dayEvents.length > 2 && (
                          <span className="text-[9px] font-mono text-[#69736D] block pl-1">
                            +{dayEvents.length - 2} more
                          </span>
                        )}
                      </div>

                      {/* Hover action indicator */}
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity flex justify-end">
                        <Plus className="w-3 h-3 text-[#205C43]" />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* VIEW 2: WEEK VIEW */}
          {viewMode === "week" && (
            <div className="p-4 divide-y divide-[#D5E5D9]/70">
              <div className="grid grid-cols-7 text-center font-mono text-xs pb-3 text-[#69736D]">
                {weekDays.map((wd, i) => {
                  const dateStr = getISTDateString(wd);
                  const isToday = dateStr === getISTDateString(new Date());
                  return (
                    <div key={i} className="space-y-1">
                      <div className="text-[11px] font-semibold">{weekDayLabels[i]}</div>
                      <div
                        className={`w-7 h-7 mx-auto rounded-full flex items-center justify-center font-mono text-xs ${
                          isToday ? "bg-[#205C43] text-white" : "text-[#202824]"
                        }`}
                      >
                        {wd.getDate()}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="grid grid-cols-7 divide-x divide-[#D5E5D9]/60 min-h-[360px] pt-3">
                {weekDays.map((wd, i) => {
                  const dateStr = getISTDateString(wd);
                  const dayEvents = eventsByDate[dateStr] || [];
                  return (
                    <div
                      key={i}
                      onClick={() => handleOpenCreateForDate(dateStr)}
                      className="p-2 space-y-2 hover:bg-[#EAF3ED]/20 cursor-pointer min-h-[280px]"
                    >
                      {dayEvents.map((ev) => {
                        const styling = EVENT_TYPE_COLORS[ev.event_type] || EVENT_TYPE_COLORS.hearing;
                        return (
                          <div
                            key={ev.id}
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedEvent(ev);
                            }}
                            className={`p-2 rounded-xl border text-xs space-y-1 transition-all ${styling.bg} ${styling.text} ${styling.border} hover:shadow-xs`}
                          >
                            <div className="flex items-center gap-1 font-semibold line-clamp-2">
                              {ev.is_court_verified && (
                                <ShieldCheck className="w-3 h-3 text-purple-700 shrink-0" />
                              )}
                              <span>{ev.title}</span>
                            </div>
                            <div className="flex items-center gap-1 text-[10px] text-[#69736D]">
                              <Clock className="w-3 h-3" />
                              <span>{timeFormatter.format(new Date(ev.start_time))}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* VIEW 3: DAY VIEW */}
          {viewMode === "day" && (() => {
            const currentDayStr = getISTDateString(currentDate);
            const currentDayEvents = eventsByDate[currentDayStr] || [];
            return (
              <div className="p-6 space-y-4">
                <div className="flex items-center justify-between pb-4 border-b border-[#D5E5D9]">
                  <h3 className="font-serif text-xl text-[#202824]">
                    {dateFormatter.format(currentDate)}
                  </h3>
                  <span className="font-mono text-xs text-[#205C43] font-semibold">
                    {currentDayEvents.length} {isHindi ? "शेड्यूल आइटम" : "Scheduled Items"}
                  </span>
                </div>

                <div className="space-y-3">
                  {currentDayEvents.length === 0 ? (
                    <div className="p-12 text-center text-[#69736D] space-y-2">
                      <CalendarIcon className="w-8 h-8 mx-auto opacity-40 text-[#205C43]" />
                      <p className="text-xs">{t.calendar.noEvents}</p>
                      <button
                        type="button"
                        onClick={() => handleOpenCreateForDate(currentDayStr)}
                        className="text-xs font-semibold text-[#205C43] hover:underline"
                      >
                        + {t.calendar.newEvent}
                      </button>
                    </div>
                  ) : (
                    currentDayEvents.map((ev) => (
                      <div
                        key={ev.id}
                        onClick={() => setSelectedEvent(ev)}
                        className="p-4 rounded-xl border border-[#D5E5D9] bg-white hover:bg-[#F8FAF9] cursor-pointer shadow-xs transition-all flex items-start justify-between gap-4"
                      >
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-2">
                            <span className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded-full font-semibold ${EVENT_TYPE_COLORS[ev.event_type].badge}`}>
                              {t.calendar[ev.event_type] || ev.event_type}
                            </span>
                            {ev.is_court_verified && (
                              <span className="inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-full bg-purple-50 text-purple-800 border border-purple-200">
                                <ShieldCheck className="w-3 h-3 text-purple-700" />
                                {t.calendar.causeListBadge}
                              </span>
                            )}
                        </div>
                        <h4 className="text-sm font-semibold text-[#202824]">{ev.title}</h4>
                        <div className="flex items-center gap-4 text-xs text-[#69736D]">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-[#205C43]" />
                            {timeFormatter.format(new Date(ev.start_time))}
                          </span>
                          {ev.location && (
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3.5 h-3.5 text-[#69736D]" />
                              {ev.location}
                            </span>
                          )}
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-[#69736D]" />
                    </div>
                  ))
                )}
              </div>
            </div>
            );
          })()}

          {/* VIEW 4: AGENDA / LIST VIEW */}
          {viewMode === "agenda" && (
            <div className="p-6 space-y-6">
              <div className="pb-3 border-b border-[#D5E5D9]">
                <h3 className="font-serif text-lg text-[#202824]">
                  {isHindi ? "आगामी कानूनी एजेंडा व तिथियाँ" : "Chronological Legal Agenda"}
                </h3>
                <p className="text-xs text-[#69736D] mt-0.5">
                  {isHindi ? "सभी न्यायालयीन सुनवाई, प्रस्तुतियाँ, और क्लाइंट परामर्श" : "Hearings, filings, consultations, and tasks ordered by date"}
                </p>
              </div>

              {filteredEvents.length === 0 ? (
                <div className="p-12 text-center text-[#69736D] space-y-2">
                  <CalendarIcon className="w-8 h-8 mx-auto opacity-40 text-[#205C43]" />
                  <p className="text-xs">{t.calendar.noEvents}</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredEvents.map((ev) => {
                    const styling = EVENT_TYPE_COLORS[ev.event_type] || EVENT_TYPE_COLORS.hearing;
                    const isUrgent = ev.priority === "urgent";
                    return (
                      <div
                        key={ev.id}
                        onClick={() => setSelectedEvent(ev)}
                        className={`p-4 rounded-xl border transition-all cursor-pointer shadow-xs flex items-start justify-between gap-4 ${
                          isUrgent ? "border-red-300 bg-red-50/20" : "border-[#D5E5D9] bg-white hover:bg-[#F8FAF9]"
                        }`}
                      >
                        <div className="space-y-1.5 flex-1">
                          <div className="flex items-center gap-2">
                            <span className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded-full font-semibold ${styling.badge}`}>
                              {t.calendar[ev.event_type] || ev.event_type}
                            </span>
                            {ev.is_court_verified ? (
                              <span className="inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-full bg-purple-50 text-purple-800 border border-purple-200">
                                <ShieldCheck className="w-3 h-3 text-purple-700" />
                                {t.calendar.causeListBadge}
                              </span>
                            ) : (
                              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-stone-100 text-stone-600">
                                {t.calendar.chamberReminderBadge}
                              </span>
                            )}
                            <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${PRIORITY_BADGES[ev.priority].color}`}>
                              {isHindi ? PRIORITY_BADGES[ev.priority].hiLabel : PRIORITY_BADGES[ev.priority].label}
                            </span>
                          </div>

                          <h4 className="text-sm font-semibold text-[#202824]">{ev.title}</h4>

                          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[#69736D]">
                            <span className="flex items-center gap-1 font-mono text-[#205C43]">
                              <Clock className="w-3.5 h-3.5" />
                              {dateFormatter.format(new Date(ev.start_time))} • {timeFormatter.format(new Date(ev.start_time))}
                            </span>
                            {ev.location && (
                              <span className="flex items-center gap-1">
                                <MapPin className="w-3.5 h-3.5" />
                                {ev.location}
                              </span>
                            )}
                            {ev.associated_name && (
                              <span className="flex items-center gap-1">
                                <User className="w-3.5 h-3.5" />
                                {ev.associated_name}
                              </span>
                            )}
                          </div>
                        </div>

                        <ChevronRight className="w-4 h-4 text-[#69736D] mt-2 shrink-0" />
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Side Panel: Event Details / Quick Inspector (1 col on desktop) */}
        <div className="bg-white rounded-2xl border border-[#D5E5D9] p-5 shadow-xs space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-[#D5E5D9]">
            <h3 className="font-serif text-base text-[#202824] font-semibold">
              {t.calendar.eventDetails}
            </h3>
            {selectedEvent && (
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => handleOpenEdit(selectedEvent)}
                  className="p-1.5 rounded-lg text-[#69736D] hover:text-[#205C43] hover:bg-[#EAF3ED]"
                  title={t.common.edit}
                >
                  <Edit3 className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => handleDeleteEvent(selectedEvent.id)}
                  disabled={isDeleting}
                  className="p-1.5 rounded-lg text-[#69736D] hover:text-red-700 hover:bg-red-50"
                  title={t.common.delete}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>

          {selectedEvent ? (
            <div className="space-y-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded-full font-semibold ${EVENT_TYPE_COLORS[selectedEvent.event_type].badge}`}>
                    {t.calendar[selectedEvent.event_type] || selectedEvent.event_type}
                  </span>
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${PRIORITY_BADGES[selectedEvent.priority].color}`}>
                    {isHindi ? PRIORITY_BADGES[selectedEvent.priority].hiLabel : PRIORITY_BADGES[selectedEvent.priority].label}
                  </span>
                </div>
                <h4 className="text-base font-semibold text-[#202824] leading-snug">
                  {selectedEvent.title}
                </h4>
              </div>

              {/* Court verification distinction */}
              <div className="p-3 rounded-xl border text-xs">
                {selectedEvent.is_court_verified ? (
                  <div className="flex items-start gap-2 text-purple-900 bg-purple-50/80 p-2 rounded-lg border border-purple-200">
                    <ShieldCheck className="w-4 h-4 text-purple-700 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold block">{t.calendar.courtVerified}</span>
                      <span className="text-[11px] text-purple-800 leading-tight">
                        {isHindi
                          ? "न्यायालय की दैनिक कॉज लिस्ट व रोस्टर से सत्यापित तिथि।"
                          : "Synchronized with official high court cause list & bench roster."}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start gap-2 text-stone-700 bg-stone-50 p-2 rounded-lg border border-stone-200">
                    <Clock className="w-4 h-4 text-stone-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold block">{t.calendar.chamberReminder}</span>
                      <span className="text-[11px] text-stone-600 leading-tight">
                        {isHindi
                          ? "चैंबर आंतरिक कार्य व परामर्श अनुसूची।"
                          : "Chamber internal reminder and preliminary consultation task."}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Date & Time */}
              <div className="space-y-2 text-xs text-[#202824] pt-2 border-t border-[#D5E5D9]/70">
                <div className="flex items-center gap-2">
                  <CalendarIcon className="w-3.5 h-3.5 text-[#205C43]" />
                  <span>{dateFormatter.format(new Date(selectedEvent.start_time))}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5 text-[#205C43]" />
                  <span>
                    {selectedEvent.is_all_day
                      ? (isHindi ? "पूरा दिन" : "All Day")
                      : `${timeFormatter.format(new Date(selectedEvent.start_time))} - ${
                          selectedEvent.end_time ? timeFormatter.format(new Date(selectedEvent.end_time)) : ""
                        }`}
                  </span>
                </div>
                {selectedEvent.location && (
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-[#69736D]" />
                    <span>{selectedEvent.location}</span>
                  </div>
                )}
                {selectedEvent.meeting_link && (
                  <div className="flex items-center gap-2">
                    <Video className="w-3.5 h-3.5 text-[#205C43]" />
                    <a
                      href={selectedEvent.meeting_link}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[#205C43] hover:underline font-medium inline-flex items-center gap-1"
                    >
                      <span>{isHindi ? "सम्मेलन लिंक खोलें" : "Open Video Conference"}</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                )}
              </div>

              {/* Associated party */}
              {selectedEvent.associated_name && (
                <div className="pt-2 border-t border-[#D5E5D9]/70 text-xs">
                  <span className="font-mono text-[10px] text-[#69736D] uppercase block mb-1">
                    {isHindi ? "संबंधित पक्षकार" : "Associated Party"}
                  </span>
                  <div className="flex items-center gap-1.5 font-medium text-[#202824]">
                    <User className="w-3.5 h-3.5 text-[#205C43]" />
                    <span>{selectedEvent.associated_name}</span>
                  </div>
                </div>
              )}

              {/* Notes */}
              {selectedEvent.notes && (
                <div className="pt-2 border-t border-[#D5E5D9]/70 text-xs">
                  <span className="font-mono text-[10px] text-[#69736D] uppercase block mb-1">
                    {t.calendar.notes}
                  </span>
                  <p className="text-[#69736D] leading-relaxed whitespace-pre-wrap bg-[#F8FAF9] p-2.5 rounded-lg border border-[#D5E5D9]">
                    {selectedEvent.notes}
                  </p>
                </div>
              )}

              {/* Reminder notice */}
              <div className="pt-2 border-t border-[#D5E5D9]/70 flex items-center gap-2 text-[11px] text-[#205C43]">
                <Bell className="w-3.5 h-3.5" />
                <span>
                  {isHindi
                    ? `${selectedEvent.reminder_minutes ?? 60} मिनट पूर्व इन-ऐप सूचना सक्रिय`
                    : `Notification active ${selectedEvent.reminder_minutes ?? 60}m prior`}
                </span>
              </div>
            </div>
          ) : (
            <div className="py-10 text-center text-[#69736D] space-y-2">
              <Scale className="w-8 h-8 text-[#205C43] mx-auto opacity-40" />
              <p className="text-xs">
                {isHindi
                  ? "विवरण देखने के लिए किसी भी ईवेंट पर क्लिक करें"
                  : "Click any event on the calendar to inspect its full case dossier"}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* CREATE EVENT MODAL */}
      <AnimatePresence>
        {isCreateModalOpen && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 bg-black/60 backdrop-blur-xs [color-scheme:light] overflow-y-auto"
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                setIsCreateModalOpen(false);
              }
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 10 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
              data-lenis-prevent
              className="relative w-full max-w-lg bg-white rounded-2xl border border-[#D5E5D9] shadow-2xl overflow-hidden flex flex-col max-h-[calc(100vh-2rem)] sm:max-h-[85vh] [color-scheme:light]"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="shrink-0 px-6 py-4 border-b border-[#D5E5D9] bg-white flex items-center justify-between">
                <div>
                  <h3 className="font-serif text-lg sm:text-xl font-semibold text-[#202824]">
                    {t.calendar.newEvent}
                  </h3>
                  <p className="text-[11px] text-[#69736D] mt-0.5">
                    {isHindi ? "चैंबर आंतरिक कार्यसूची एवं केस सुनवाई प्रविष्टि" : "Chamber docket & legal proceeding record"}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="p-1.5 rounded-lg text-[#69736D] hover:text-[#202824] hover:bg-[#F2F7F4] transition-colors"
                  aria-label={t.common.cancel}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateSubmit} className="flex-1 flex flex-col min-h-0 text-xs">
                <div className="flex-1 overflow-y-auto p-6 space-y-4 data-lenis-prevent overscroll-contain">
                  {errorFeedback && (
                    <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-800 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0 text-red-700" />
                      <span>{errorFeedback}</span>
                    </div>
                  )}

                  {/* Title */}
                  <div>
                    <label className="block text-[11px] font-semibold text-[#202824] uppercase font-mono mb-1.5">
                      {t.calendar.eventTitle} *
                    </label>
                    <input
                      type="text"
                      required
                      value={formTitle}
                      onChange={(e) => setFormTitle(e.target.value)}
                      placeholder={isHindi ? "उदा. उच्च न्यायालय में अग्रिम जमानत सुनवाई" : "e.g. Anticipatory Bail Hearing — Court 4"}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#D5E5D9] bg-white text-[#202824] placeholder-[#8F9A93] focus:outline-none focus:ring-2 focus:ring-[#205C43]/20 focus:border-[#205C43] transition-all text-xs font-normal [color-scheme:light]"
                    />
                  </div>

                  {/* Event Type & Priority */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-[#202824] uppercase font-mono mb-1.5">
                        {t.calendar.eventType}
                      </label>
                      <select
                        value={formType}
                        onChange={(e) => setFormType(e.target.value as LegalEventType)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-[#D5E5D9] bg-white text-[#202824] focus:outline-none focus:ring-2 focus:ring-[#205C43]/20 focus:border-[#205C43] transition-all text-xs font-normal [color-scheme:light]"
                      >
                        <option value="hearing">{t.calendar.hearing}</option>
                        <option value="consultation">{t.calendar.consultation}</option>
                        <option value="deadline">{t.calendar.deadline}</option>
                        <option value="filing">{t.calendar.filing}</option>
                        <option value="meeting">{t.calendar.meeting}</option>
                        <option value="task">{t.calendar.task}</option>
                        <option value="reminder">{t.calendar.reminder}</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-[#202824] uppercase font-mono mb-1.5">
                        {t.common.priority}
                      </label>
                      <select
                        value={formPriority}
                        onChange={(e) => setFormPriority(e.target.value as CalendarPriority)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-[#D5E5D9] bg-white text-[#202824] focus:outline-none focus:ring-2 focus:ring-[#205C43]/20 focus:border-[#205C43] transition-all text-xs font-normal [color-scheme:light]"
                      >
                        <option value="low">{isHindi ? "सामान्य" : "Low"}</option>
                        <option value="medium">{isHindi ? "मध्यम" : "Medium"}</option>
                        <option value="high">{isHindi ? "उच्च" : "High"}</option>
                        <option value="urgent">{isHindi ? "अति आवश्यक" : "Urgent"}</option>
                      </select>
                    </div>
                  </div>

                  {/* Date & Time fields */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-[#202824] uppercase font-mono mb-1.5">
                        {isHindi ? "प्रारंभ तिथि" : "Start Date"}
                      </label>
                      <input
                        type="date"
                        value={formStartDate}
                        onChange={(e) => setFormStartDate(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-[#D5E5D9] bg-white text-[#202824] focus:outline-none focus:ring-2 focus:ring-[#205C43]/20 focus:border-[#205C43] transition-all text-xs font-normal [color-scheme:light]"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-[#202824] uppercase font-mono mb-1.5">
                        {isHindi ? "प्रारंभ समय (IST)" : "Start Time (IST)"}
                      </label>
                      <input
                        type="time"
                        value={formStartTime}
                        onChange={(e) => setFormStartTime(e.target.value)}
                        disabled={formIsAllDay}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-[#D5E5D9] bg-white text-[#202824] focus:outline-none focus:ring-2 focus:ring-[#205C43]/20 focus:border-[#205C43] transition-all text-xs font-normal disabled:bg-[#F8FAF9] disabled:text-[#8F9A93] [color-scheme:light]"
                      />
                    </div>
                  </div>

                  {/* All-day Checkbox */}
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="all-day-check-create"
                      checked={formIsAllDay}
                      onChange={(e) => setFormIsAllDay(e.target.checked)}
                      className="w-4 h-4 rounded text-[#205C43] focus:ring-[#205C43] border-[#D5E5D9] accent-[#205C43]"
                    />
                    <label htmlFor="all-day-check-create" className="text-xs text-[#202824] cursor-pointer select-none">
                      {isHindi ? "पूरा दिन (कोई विशिष्ट समय नहीं)" : "All day event (no specific time)"}
                    </label>
                  </div>

                  {/* Honest Chamber Docket Verification Notice */}
                  <div className="p-3.5 rounded-xl bg-[#F4F8F5] border border-[#D5E5D9] flex items-start gap-3">
                    <Scale className="w-4 h-4 text-[#205C43] shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <div className="text-[11px] font-semibold text-[#202824] flex items-center gap-1.5">
                        <span>{isHindi ? "चैंबर आंतरिक प्रविष्टि (अधिवक्ता द्वारा दर्ज)" : "Chamber Docket Entry (Self-Reported)"}</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#EAF3ED] text-[#205C43] font-mono font-medium">
                          {isHindi ? "आंतरिक" : "Internal"}
                        </span>
                      </div>
                      <p className="text-[11px] text-[#69736D] leading-relaxed">
                        {isHindi
                          ? "यह प्रविष्टि आपके चैंबर व मुवक्किल कैलेंडर में सुरक्षित रहेगी। आधिकारिक न्यायालय सत्यापन केवल दैनिक कॉज लिस्ट मिलान के उपरांत प्रदर्शित होता है।"
                          : "Recorded in your chamber and client schedule. Official court cause-list verification badge appears when verified via judicial listing records."}
                      </p>
                    </div>
                  </div>

                  {/* Location & Associated Party */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-[#202824] uppercase font-mono mb-1.5">
                        {t.calendar.location}
                      </label>
                      <input
                        type="text"
                        value={formLocation}
                        onChange={(e) => setFormLocation(e.target.value)}
                        placeholder={isHindi ? "उदा. न्यायालय कक्ष 4, दिल्ली उच्च न्यायालय" : "e.g. Courtroom 4, High Court"}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-[#D5E5D9] bg-white text-[#202824] placeholder-[#8F9A93] focus:outline-none focus:ring-2 focus:ring-[#205C43]/20 focus:border-[#205C43] transition-all text-xs font-normal [color-scheme:light]"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-[#202824] uppercase font-mono mb-1.5">
                        {isHindi ? "संबंधित पक्षकार" : "Associated Party"}
                      </label>
                      <input
                        type="text"
                        value={formAssociatedName}
                        onChange={(e) => setFormAssociatedName(e.target.value)}
                        placeholder={isHindi ? "उदा. राजेश कुमार (मुवक्किल)" : "e.g. Rajesh Kumar (Client)"}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-[#D5E5D9] bg-white text-[#202824] placeholder-[#8F9A93] focus:outline-none focus:ring-2 focus:ring-[#205C43]/20 focus:border-[#205C43] transition-all text-xs font-normal [color-scheme:light]"
                      />
                    </div>
                  </div>

                  {/* Procedural Notes */}
                  <div>
                    <label className="block text-[11px] font-semibold text-[#202824] uppercase font-mono mb-1.5">
                      {t.calendar.notes}
                    </label>
                    <textarea
                      rows={3}
                      value={formNotes}
                      onChange={(e) => setFormNotes(e.target.value)}
                      placeholder={isHindi ? "कानूनी निर्देश, आवश्यक दस्तावेज या केस संदर्भ..." : "Hearing preparation notes, required case documents..."}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#D5E5D9] bg-white text-[#202824] placeholder-[#8F9A93] focus:outline-none focus:ring-2 focus:ring-[#205C43]/20 focus:border-[#205C43] transition-all text-xs font-normal [color-scheme:light] resize-y"
                    />
                  </div>
                </div>

                {/* Sticky Action Footer */}
                <div className="shrink-0 px-6 py-3.5 border-t border-[#D5E5D9] bg-[#F8FAF9]/95 flex items-center justify-end gap-2.5 backdrop-blur-xs">
                  <button
                    type="button"
                    onClick={() => setIsCreateModalOpen(false)}
                    className="px-4 py-2 rounded-xl border border-[#D5E5D9] bg-white hover:bg-[#F2F7F4] text-[#4F5953] font-medium text-xs transition-colors"
                  >
                    {t.common.cancel}
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-5 py-2 rounded-xl bg-[#205C43] hover:bg-[#174530] text-white font-medium text-xs shadow-xs transition-all disabled:opacity-50"
                  >
                    {isSubmitting ? t.common.loading : t.common.create}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* EDIT EVENT MODAL */}
      <AnimatePresence>
        {isEditModalOpen && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 bg-black/60 backdrop-blur-xs [color-scheme:light] overflow-y-auto"
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                setIsEditModalOpen(false);
              }
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 10 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
              data-lenis-prevent
              className="relative w-full max-w-lg bg-white rounded-2xl border border-[#D5E5D9] shadow-2xl overflow-hidden flex flex-col max-h-[calc(100vh-2rem)] sm:max-h-[85vh] [color-scheme:light]"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="shrink-0 px-6 py-4 border-b border-[#D5E5D9] bg-white flex items-center justify-between">
                <div>
                  <h3 className="font-serif text-lg sm:text-xl font-semibold text-[#202824]">
                    {t.calendar.editEvent}
                  </h3>
                  <p className="text-[11px] text-[#69736D] mt-0.5">
                    {isHindi ? "कानूनी ईवेंट विवरण व अनुसूची संशोधन" : "Update legal proceeding record and schedule"}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="p-1.5 rounded-lg text-[#69736D] hover:text-[#202824] hover:bg-[#F2F7F4] transition-colors"
                  aria-label={t.common.cancel}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleEditSubmit} className="flex-1 flex flex-col min-h-0 text-xs">
                <div className="flex-1 overflow-y-auto p-6 space-y-4 data-lenis-prevent overscroll-contain">
                  {errorFeedback && (
                    <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-800 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0 text-red-700" />
                      <span>{errorFeedback}</span>
                    </div>
                  )}

                  {/* Title */}
                  <div>
                    <label className="block text-[11px] font-semibold text-[#202824] uppercase font-mono mb-1.5">
                      {t.calendar.eventTitle} *
                    </label>
                    <input
                      type="text"
                      required
                      value={formTitle}
                      onChange={(e) => setFormTitle(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#D5E5D9] bg-white text-[#202824] placeholder-[#8F9A93] focus:outline-none focus:ring-2 focus:ring-[#205C43]/20 focus:border-[#205C43] transition-all text-xs font-normal [color-scheme:light]"
                    />
                  </div>

                  {/* Event Type & Priority */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-[#202824] uppercase font-mono mb-1.5">
                        {t.calendar.eventType}
                      </label>
                      <select
                        value={formType}
                        onChange={(e) => setFormType(e.target.value as LegalEventType)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-[#D5E5D9] bg-white text-[#202824] focus:outline-none focus:ring-2 focus:ring-[#205C43]/20 focus:border-[#205C43] transition-all text-xs font-normal [color-scheme:light]"
                      >
                        <option value="hearing">{t.calendar.hearing}</option>
                        <option value="consultation">{t.calendar.consultation}</option>
                        <option value="deadline">{t.calendar.deadline}</option>
                        <option value="filing">{t.calendar.filing}</option>
                        <option value="meeting">{t.calendar.meeting}</option>
                        <option value="task">{t.calendar.task}</option>
                        <option value="reminder">{t.calendar.reminder}</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-[#202824] uppercase font-mono mb-1.5">
                        {t.common.priority}
                      </label>
                      <select
                        value={formPriority}
                        onChange={(e) => setFormPriority(e.target.value as CalendarPriority)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-[#D5E5D9] bg-white text-[#202824] focus:outline-none focus:ring-2 focus:ring-[#205C43]/20 focus:border-[#205C43] transition-all text-xs font-normal [color-scheme:light]"
                      >
                        <option value="low">{isHindi ? "सामान्य" : "Low"}</option>
                        <option value="medium">{isHindi ? "मध्यम" : "Medium"}</option>
                        <option value="high">{isHindi ? "उच्च" : "High"}</option>
                        <option value="urgent">{isHindi ? "अति आवश्यक" : "Urgent"}</option>
                      </select>
                    </div>
                  </div>

                  {/* Date & Time fields */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-[#202824] uppercase font-mono mb-1.5">
                        {isHindi ? "प्रारंभ तिथि" : "Start Date"}
                      </label>
                      <input
                        type="date"
                        value={formStartDate}
                        onChange={(e) => setFormStartDate(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-[#D5E5D9] bg-white text-[#202824] focus:outline-none focus:ring-2 focus:ring-[#205C43]/20 focus:border-[#205C43] transition-all text-xs font-normal [color-scheme:light]"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-[#202824] uppercase font-mono mb-1.5">
                        {isHindi ? "प्रारंभ समय (IST)" : "Start Time (IST)"}
                      </label>
                      <input
                        type="time"
                        value={formStartTime}
                        onChange={(e) => setFormStartTime(e.target.value)}
                        disabled={formIsAllDay}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-[#D5E5D9] bg-white text-[#202824] focus:outline-none focus:ring-2 focus:ring-[#205C43]/20 focus:border-[#205C43] transition-all text-xs font-normal disabled:bg-[#F8FAF9] disabled:text-[#8F9A93] [color-scheme:light]"
                      />
                    </div>
                  </div>

                  {/* All-day Checkbox */}
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="all-day-check-edit"
                      checked={formIsAllDay}
                      onChange={(e) => setFormIsAllDay(e.target.checked)}
                      className="w-4 h-4 rounded text-[#205C43] focus:ring-[#205C43] border-[#D5E5D9] accent-[#205C43]"
                    />
                    <label htmlFor="all-day-check-edit" className="text-xs text-[#202824] cursor-pointer select-none">
                      {isHindi ? "पूरा दिन (कोई विशिष्ट समय नहीं)" : "All day event (no specific time)"}
                    </label>
                  </div>

                  {/* Verification Status Banner */}
                  {selectedEvent?.is_court_verified ? (
                    <div className="p-3.5 rounded-xl bg-purple-50/70 border border-purple-200 flex items-start gap-3">
                      <ShieldCheck className="w-4 h-4 text-purple-700 shrink-0 mt-0.5" />
                      <div className="space-y-1">
                        <div className="text-[11px] font-semibold text-purple-900 flex items-center gap-1.5">
                          <span>{t.calendar.courtVerified}</span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-100 text-purple-800 font-mono font-medium">
                            {t.calendar.causeListBadge}
                          </span>
                        </div>
                        <p className="text-[11px] text-purple-800 leading-relaxed">
                          {isHindi
                            ? "यह प्रविष्टि आधिकारिक न्यायालय दैनिक कॉज लिस्ट व रोस्टर से सत्यापित है।"
                            : "This proceeding is verified against official court daily cause lists and roster records."}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="p-3.5 rounded-xl bg-[#F4F8F5] border border-[#D5E5D9] flex items-start gap-3">
                      <Scale className="w-4 h-4 text-[#205C43] shrink-0 mt-0.5" />
                      <div className="space-y-1">
                        <div className="text-[11px] font-semibold text-[#202824] flex items-center gap-1.5">
                          <span>{isHindi ? "चैंबर आंतरिक प्रविष्टि (अधिवक्ता द्वारा दर्ज)" : "Chamber Docket Entry (Self-Reported)"}</span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#EAF3ED] text-[#205C43] font-mono font-medium">
                            {isHindi ? "आंतरिक" : "Internal"}
                          </span>
                        </div>
                        <p className="text-[11px] text-[#69736D] leading-relaxed">
                          {isHindi
                            ? "यह प्रविष्टि आपके चैंबर व मुवक्किल कैलेंडर में सुरक्षित रहेगी। आधिकारिक न्यायालय सत्यापन केवल दैनिक कॉज लिस्ट मिलान के उपरांत प्रदर्शित होता है।"
                            : "Recorded in your chamber and client schedule. Official court cause-list verification badge appears when verified via judicial listing records."}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Location & Associated Party */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-[#202824] uppercase font-mono mb-1.5">
                        {t.calendar.location}
                      </label>
                      <input
                        type="text"
                        value={formLocation}
                        onChange={(e) => setFormLocation(e.target.value)}
                        placeholder={isHindi ? "उदा. न्यायालय कक्ष 4, दिल्ली उच्च न्यायालय" : "e.g. Courtroom 4, High Court"}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-[#D5E5D9] bg-white text-[#202824] placeholder-[#8F9A93] focus:outline-none focus:ring-2 focus:ring-[#205C43]/20 focus:border-[#205C43] transition-all text-xs font-normal [color-scheme:light]"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-[#202824] uppercase font-mono mb-1.5">
                        {isHindi ? "संबंधित पक्षकार" : "Associated Party"}
                      </label>
                      <input
                        type="text"
                        value={formAssociatedName}
                        onChange={(e) => setFormAssociatedName(e.target.value)}
                        placeholder={isHindi ? "उदा. राजेश कुमार (मुवक्किल)" : "e.g. Rajesh Kumar (Client)"}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-[#D5E5D9] bg-white text-[#202824] placeholder-[#8F9A93] focus:outline-none focus:ring-2 focus:ring-[#205C43]/20 focus:border-[#205C43] transition-all text-xs font-normal [color-scheme:light]"
                      />
                    </div>
                  </div>

                  {/* Procedural Notes */}
                  <div>
                    <label className="block text-[11px] font-semibold text-[#202824] uppercase font-mono mb-1.5">
                      {t.calendar.notes}
                    </label>
                    <textarea
                      rows={3}
                      value={formNotes}
                      onChange={(e) => setFormNotes(e.target.value)}
                      placeholder={isHindi ? "कानूनी निर्देश, आवश्यक दस्तावेज या केस संदर्भ..." : "Hearing preparation notes, required case documents..."}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#D5E5D9] bg-white text-[#202824] placeholder-[#8F9A93] focus:outline-none focus:ring-2 focus:ring-[#205C43]/20 focus:border-[#205C43] transition-all text-xs font-normal [color-scheme:light] resize-y"
                    />
                  </div>
                </div>

                {/* Sticky Action Footer */}
                <div className="shrink-0 px-6 py-3.5 border-t border-[#D5E5D9] bg-[#F8FAF9]/95 flex items-center justify-end gap-2.5 backdrop-blur-xs">
                  <button
                    type="button"
                    onClick={() => setIsEditModalOpen(false)}
                    className="px-4 py-2 rounded-xl border border-[#D5E5D9] bg-white hover:bg-[#F2F7F4] text-[#4F5953] font-medium text-xs transition-colors"
                  >
                    {t.common.cancel}
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-5 py-2 rounded-xl bg-[#205C43] hover:bg-[#174530] text-white font-medium text-xs shadow-xs transition-all disabled:opacity-50"
                  >
                    {isSubmitting ? t.common.loading : t.common.save}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
