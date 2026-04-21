const express = require('express');
const cors = require('cors');
const crypto = require('crypto');

const app = express();
app.use(express.json());
app.use(cors());



let rooms = [];


let guests = [];



let reservations = [];


const roleMiddleware = (allowedRoles) => {
  return (req, res, next) => {
    const role = (req.headers['x-user-role'] || '').toUpperCase();
    if (!allowedRoles.includes(role)) {
      return res.status(403).json({ error: `Acces denied. Required role: ${allowedRoles.join(' or ')}` });
    }
    next();
  };
};

const adminOnly = roleMiddleware(['ADMIN']);
const staffOrAdmin = roleMiddleware(['ADMIN', 'STAFF']);


const calculateDaysDifference = (checkInStr, checkOutStr) => {
  const dIn = new Date(checkInStr);
  const dOut = new Date(checkOutStr);
  const diffTime = Math.abs(dOut - dIn);
  let days = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return days > 0 ? days : 1; 
};

const isOverlapping = (checkIn, checkOut, roomId) => {
  const dIn = new Date(checkIn).getTime();
  const dOut = new Date(checkOut).getTime();

  return reservations.some(res => {
    if (res.status === 'CONFIRMADA' && res.room_id === roomId) {
      const eIn = new Date(res.check_in).getTime();
      const eOut = new Date(res.check_out).getTime();
      
      return (dIn < eOut && eIn < dOut);
    }
    return false;
  });
};



app.get('/api/rooms', staffOrAdmin, (req, res) => {
  res.json(rooms);
});

app.post('/api/rooms', adminOnly, (req, res) => {
  const { number, type, price_per_night } = req.body;
  if (!number || !type || !price_per_night) {
    return res.status(400).json({ error: 'Missing fields' });
  }
  const newRoom = { 
    id: crypto.randomUUID(), 
    number, 
    type, 
    price_per_night: parseFloat(price_per_night) 
  };
  rooms.push(newRoom);
  res.status(201).json(newRoom);
});

app.put('/api/rooms/:id', adminOnly, (req, res) => {
  const id = req.params.id;
  const idx = rooms.findIndex(r => r.id === id);
  if (idx === -1) return res.status(404).json({ error: 'Room not found' });
  
  if (req.body.price_per_night) req.body.price_per_night = parseFloat(req.body.price_per_night);
  rooms[idx] = { ...rooms[idx], ...req.body, id };
  res.json(rooms[idx]);
});

app.delete('/api/rooms/:id', adminOnly, (req, res) => {
  rooms = rooms.filter(r => r.id !== req.params.id);
  res.status(204).send();
});


app.get('/api/rooms/availability', staffOrAdmin, (req, res) => {
  const { from, to } = req.query;
  if (!from || !to) return res.status(400).json({ error: "Missing 'from' or 'to' query parameters" });
  if (new Date(from) >= new Date(to)) {
    return res.status(400).json({ error: "'from' date must be strictly before 'to' date" });
  }

  const availableRooms = rooms.filter(room => !isOverlapping(from, to, room.id));
  res.json(availableRooms);
});



app.get('/api/guests', staffOrAdmin, (req, res) => {
  res.json(guests);
});

app.post('/api/guests', staffOrAdmin, (req, res) => {
  const { name, doc_id } = req.body;
  if (!name || !doc_id) return res.status(400).json({ error: 'Missing fields' });
  
  if (guests.some(g => g.doc_id === doc_id)) {
    return res.status(400).json({ error: 'Document ID already exists' });
  }

  const newGuest = { id: crypto.randomUUID(), name, doc_id };
  guests.push(newGuest);
  res.status(201).json(newGuest);
});

app.put('/api/guests/:id', staffOrAdmin, (req, res) => {
  const id = req.params.id;
  const idx = guests.findIndex(g => g.id === id);
  if (idx === -1) return res.status(404).json({ error: 'Guest not found' });
  
  if (req.body.doc_id && req.body.doc_id !== guests[idx].doc_id) {
    if (guests.some(g => g.doc_id === req.body.doc_id)) {
      return res.status(400).json({ error: 'Document ID already exists' });
    }
  }

  guests[idx] = { ...guests[idx], ...req.body, id };
  res.json(guests[idx]);
});

app.delete('/api/guests/:id', staffOrAdmin, (req, res) => {
  guests = guests.filter(g => g.id !== req.params.id);
  res.status(204).send();
});




app.get('/api/reservations', staffOrAdmin, (req, res) => {
  res.json(reservations);
});

app.post('/api/reservations', staffOrAdmin, (req, res) => {
  const { room_id, guest_id, check_in, check_out } = req.body;

  if (!room_id || !guest_id || !check_in || !check_out) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  
  if (new Date(check_in) >= new Date(check_out)) {
    return res.status(400).json({ error: 'check_in date must be earlier than check_out date' });
  }

  
  const room = rooms.find(r => r.id === room_id);
  if (!room) return res.status(404).json({ error: 'Room not found' });

  
  const guest = guests.find(g => g.id === guest_id);
  if (!guest) return res.status(404).json({ error: 'Guest not found' });

  
  if (isOverlapping(check_in, check_out, room_id)) {
    return res.status(400).json({ error: 'Room is already confirmed for these dates by another reservation' });
  }

  
  const days = calculateDaysDifference(check_in, check_out);
  const total_cost = days * room.price_per_night;

  const newReservation = {
    id: crypto.randomUUID(),
    room_id,
    guest_id,
    check_in,
    check_out,
    status: 'CREADA',
    total_cost
  };

  reservations.push(newReservation);
  res.status(201).json(newReservation);
});

app.put('/api/reservations/:id/confirm', staffOrAdmin, (req, res) => {
  const id = req.params.id;
  const idx = reservations.findIndex(r => r.id === id);
  if (idx === -1) return res.status(404).json({ error: 'Reservation not found' });
  
  const targetReservation = reservations[idx];

  
  if (targetReservation.status === 'CANCELADA') {
    return res.status(400).json({ error: 'Cannot confirm a cancelled reservation' });
  }

  
  
  if (isOverlapping(targetReservation.check_in, targetReservation.check_out, targetReservation.room_id)) {
      return res.status(400).json({ error: 'Room is already confirmed for these dates by another reservation' });
  }

  reservations[idx].status = 'CONFIRMADA';
  res.json(reservations[idx]);
});

app.put('/api/reservations/:id/cancel', staffOrAdmin, (req, res) => {
  const id = req.params.id;
  const idx = reservations.findIndex(r => r.id === id);
  if (idx === -1) return res.status(404).json({ error: 'Reservation not found' });
  
  reservations[idx].status = 'CANCELADA';
  res.json(reservations[idx]);
});



app.get('/api/reports/occupancy', staffOrAdmin, (req, res) => {
    const { from, to } = req.query;
    if (!from || !to) return res.status(400).json({ error: "Missing 'from' or 'to' query parameters" });
    
    let totalNightsPossible = 0;
    let nightsBooked = 0;
    let totalRevenue = 0;
    
    const daysInRange = calculateDaysDifference(from, to);
    totalNightsPossible = rooms.length * daysInRange;

    const fromTime = new Date(from).getTime();
    const toTime = new Date(to).getTime();

    const roomDetails = rooms.map(r => ({ room: r, nights: 0, revenue: 0 }));

    reservations.filter(res => res.status === 'CONFIRMADA').forEach(res => {
        const resIn = new Date(res.check_in).getTime();
        const resOut = new Date(res.check_out).getTime();
        
        
        const latestStart = Math.max(fromTime, resIn);
        const earliestEnd = Math.min(toTime, resOut);

        if (latestStart < earliestEnd) {
             const overlapDays = Math.ceil((earliestEnd - latestStart) / (1000 * 60 * 60 * 24));
             nightsBooked += overlapDays;
             
             const rDetail = roomDetails.find(d => d.room.id === res.room_id);
             if (rDetail) {
                 rDetail.nights += overlapDays;
                 rDetail.revenue += (overlapDays * rDetail.room.price_per_night);
                 totalRevenue += (overlapDays * rDetail.room.price_per_night);
             }
        }
    });

    const occupancyRate = totalNightsPossible === 0 ? 0 : (nightsBooked / totalNightsPossible) * 100;

    res.json({
        occupancy_rate: occupancyRate,
        total_nights_possible: totalNightsPossible,
        nights_booked: nightsBooked,
        total_revenue: totalRevenue,
        room_breakdown: roomDetails
    });
});


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log('Provide header "X-User-Role: ADMIN" or "X-User-Role: STAFF" in your requests.');
});
