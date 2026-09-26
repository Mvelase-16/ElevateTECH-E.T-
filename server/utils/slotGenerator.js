// Computes time slots for today with real-time past-time checking and capacity status
function computeSlotsWithStatus(rawSlots = []) {
  // Use South African Standard Time (UTC+2)
  const now = new Date();
  const sastTime = new Date(now.toLocaleString('en-US', { timeZone: 'Africa/Johannesburg' }));
  const currentHour = sastTime.getHours();
  const currentMinute = sastTime.getMinutes();
  const currentTimeInMinutes = currentHour * 60 + currentMinute;

  // Cafeteria operational hours are 08:00 to 19:00.
  // If current time is after 19:00, bookings automatically open for the next day's service!
  const isAfterHours = currentTimeInMinutes > (19 * 60);

  return rawSlots.map(slot => {
    // Parse slot start time (e.g. "08:00:00" or from slot_time "8:00 AM - 8:30 AM")
    let slotStartMinutes = 0;
    if (slot.start_time) {
      const [h, m] = slot.start_time.split(':').map(Number);
      slotStartMinutes = h * 60 + m;
    } else {
      // Fallback parse from slot_time string "8:00 AM - 8:30 AM"
      const match = slot.slot_time.match(/^(\d+):(\d+)\s*(AM|PM)/i);
      if (match) {
        let h = parseInt(match[1]);
        const m = parseInt(match[2]);
        const period = match[3].toUpperCase();
        if (period === 'PM' && h !== 12) h += 12;
        if (period === 'AM' && h === 12) h = 0;
        slotStartMinutes = h * 60 + m;
      }
    }

    // A slot has passed if currentTime is past slot start time during today's service
    const isPast = isAfterHours ? false : (currentTimeInMinutes > (slotStartMinutes + 5));
    const maxCapacity = slot.max_capacity || 15;
    const currentBookings = slot.current_bookings || 0;
    const spotsRemaining = Math.max(0, maxCapacity - currentBookings);
    const isFull = spotsRemaining === 0;

    return {
      id: slot.id,
      slot_time: slot.slot_time,
      start_time: slot.start_time,
      end_time: slot.end_time,
      max_capacity: maxCapacity,
      current_bookings: currentBookings,
      spots_remaining: spotsRemaining,
      is_past: isPast,
      is_full: isFull,
      is_available: !isPast && !isFull && (slot.is_active !== false && slot.is_active !== 0)
    };
  });
}

module.exports = {
  computeSlotsWithStatus
};
