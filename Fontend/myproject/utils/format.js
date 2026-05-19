export const formatSlots = (workdays) => {
    return workdays.map(day => {
        const slots = { morning: [], afternoon: [], evening: [] };

        day.time_slots.forEach(slot => {
            const hour = parseInt(slot.start_time.split(":")[0]);
            const item = {
                id: slot.id,
                start_time: slot.start_time.slice(0, 5),
                end_time: slot.end_time.slice(0, 5),
                label: `${slot.start_time.slice(0, 5)} - ${slot.end_time.slice(0, 5)}`,
                status: slot.status,
            };

            if (hour < 12) slots.morning.push(item);
            else if (hour < 18) slots.afternoon.push(item);
            else slots.evening.push(item);
        });

        return {
            id: day.id,
            date: day.date,
            day_of_week: day.day_of_week,
            slots,
        };
    });
};


export const formatDoctors = (doctors) => {
    return doctors.map(doctor => ({
        id: doctor.id,
        type: "doctor",
        name: `${doctor.last_name} ${doctor.first_name}`,
        description: doctor.profile?.price,
        specialty: doctor.phone,
    }));
};

export const formatDate = (date) => {
    const [year, month, day] = date.split("-");
    return `${day}/${month}/${year}`;
  };