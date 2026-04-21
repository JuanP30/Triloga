document.addEventListener('DOMContentLoaded', () => {

    const API_BASE = 'http://localhost:3000/api';
    
    
    const path = window.location.pathname;
    
    
    const btnAdmin = document.getElementById('btn-login-admin');
    const btnStaff = document.getElementById('btn-login-staff');
    
    if (btnAdmin && btnStaff) {
        btnAdmin.addEventListener('click', () => {
            localStorage.setItem('user_role', 'ADMIN');
            window.location.href = 'admin_dashboard.html';
        });
        btnStaff.addEventListener('click', () => {
            localStorage.setItem('user_role', 'STAFF');
            window.location.href = 'staff_dashboard.html';
        });
    }

    
    let userRole = localStorage.getItem('user_role');
    if (!path.includes('index.html') && path !== '/') {
        if (!userRole) {
            window.location.href = 'index.html';
            return;
        }

        const adminOnlyPaths = ['admin_dashboard', 'habitaciones', 'reporte'];
        if (userRole === 'STAFF' && adminOnlyPaths.some(p => path.includes(p))) {
            alert('Acceso Denegado. Se requiere rol ADMIN.');
            window.location.href = 'staff_dashboard.html';
            return;
        }

        
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            if (link.textContent.includes('Cerrar Sesión')) {
                link.addEventListener('click', (e) => {
                    e.preventDefault();
                    localStorage.removeItem('user_role');
                    window.location.href = 'index.html';
                });
            }
        });
    }

    
    async function fetchAPI(endpoint, method = 'GET', body = null) {
        const headers = {
            'Content-Type': 'application/json',
            'x-user-role': userRole || ''
        };
        const options = { method, headers };
        if (body) options.body = JSON.stringify(body);

        try {
            const res = await fetch(`${API_BASE}${endpoint}`, options);
            if(res.status === 204) return true; 
            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.error || 'Request Failed');
            }
            return await res.json();
        } catch (error) {
            showAlert(error.message, 'danger');
            throw error;
        }
    }

    
    function showAlert(message, type = 'info') {
        const existing = document.querySelector('.floating-alert');
        if(existing) existing.remove();

        const alertDiv = document.createElement('div');
        alertDiv.className = 'floating-alert';
        alertDiv.textContent = message;

        Object.assign(alertDiv.style, {
            position: 'fixed', bottom: '20px', right: '20px',
            backgroundColor: type === 'success' ? '#10b981' : (type === 'danger' ? '#ef4444' : '#3b82f6'),
            color: 'white', padding: '1rem 2rem', borderRadius: '8px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', zIndex: '9999'
        });

        document.body.appendChild(alertDiv);
        setTimeout(() => alertDiv.remove(), 3000);
    }

    const closeModal = () => { if (window.location.hash) window.location.hash = '#'; };

    

    if (path.includes('habitacion')) {
        loadRooms();

        const roomForm = document.querySelector('#newRoomModal form');
        if (roomForm) {
            roomForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                const inputs = roomForm.querySelectorAll('input, select');
                const number = inputs[0].value;
                const type = inputs[1].value;
                const price_per_night = inputs[2].value;

                try {
                    await fetchAPI('/rooms', 'POST', { number, type, price_per_night });
                    showAlert('Habitación Creada', 'success');
                    closeModal();
                    roomForm.reset();
                    loadRooms();
                } catch (e) { }
            });
        }
    }

    if (path.includes('huesped')) {
        loadGuests();

        const guestForm = document.querySelector('#newGuestModal form');
        if (guestForm) {
            guestForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                const inputs = guestForm.querySelectorAll('input');
                const name = inputs[0].value;
                const doc_id = inputs[1].value;

                try {
                    await fetchAPI('/guests', 'POST', { name, doc_id });
                    showAlert('Huésped Creado', 'success');
                    closeModal();
                    guestForm.reset();
                    loadGuests();
                } catch (e) { }
            });
        }
    }

    if (path.includes('reservacion')) {
        loadReservations();
        populateReservationSelects();

        const resForm = document.querySelector('#newReservationModal form');
        if (resForm) {
            resForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                const selects = resForm.querySelectorAll('select');
                const inputs = resForm.querySelectorAll('input');
                
                const guest_id = selects[0].value;
                const room_id = selects[1].value;
                const check_in = inputs[0].value;
                const check_out = inputs[1].value;

                try {
                    await fetchAPI('/reservations', 'POST', { guest_id, room_id, check_in, check_out });
                    showAlert('Reserva Creada', 'success');
                    closeModal();
                    resForm.reset();
                    loadReservations();
                } catch (e) { }
            });

            
            const checkOutInput = resForm.querySelectorAll('input')[1];
            if(checkOutInput) {
                checkOutInput.addEventListener('change', () => {
                     const selRoom = resForm.querySelectorAll('select')[1];
                     const opt = selRoom.options[selRoom.selectedIndex];
                     const inVal = resForm.querySelectorAll('input')[0].value;
                     const outVal = checkOutInput.value;
                     if(opt && inVal && outVal && opt.dataset.price) {
                         const dIn = new Date(inVal); 
                         const dOut = new Date(outVal);
                         const days = Math.ceil(Math.abs(dOut - dIn) / (1000 * 60 * 60 * 24));
                         const total = (days > 0 ? days : 1) * parseFloat(opt.dataset.price);
                         document.querySelector('#newReservationModal .form-group div').textContent = `$ ${total.toLocaleString()} COP`;
                     }
                });
            }
        }
    }

    if (path.includes('disponibilidad')) {
        const form = document.querySelector('.card form');
        const searchBtn = form.querySelector('button');
        if (searchBtn) {
            searchBtn.addEventListener('click', async () => {
                const inVal = form.querySelectorAll('input')[0].value;
                const outVal = form.querySelectorAll('input')[1].value;
                if(!inVal || !outVal) return showAlert('Filtra las fechas', 'danger');

                try {
                    const available = await fetchAPI(`/rooms/availability?from=${inVal}&to=${outVal}`);
                    renderAvailableRooms(available, inVal, outVal);
                } catch (error) { }
            });
        }
    }

    if (path.includes('reporte')) {
        const btnGenerar = document.querySelector('.card form button');
        if (btnGenerar) {
            btnGenerar.addEventListener('click', async () => {
                const inVal = document.querySelectorAll('.card form input')[0].value;
                const outVal = document.querySelectorAll('.card form input')[1].value;
                
                try {
                    const report = await fetchAPI(`/reports/occupancy?from=${inVal}&to=${outVal}`);
                    renderReport(report);
                } catch (e) { }
            });
        }
    }

    if (path.includes('dashboard')) {
        loadDashboardStats();
    }


    

    
    const saveButtons = document.querySelectorAll('.modal-footer .btn-primary');
    saveButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const form = btn.closest('.modal').querySelector('form');
            if (form) {
                if (!form.checkValidity()) {
                    form.reportValidity(); return;
                }
                form.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
            }
        });
    });

    async function loadRooms() {
        const tbody = document.querySelector('table tbody');
        if (!tbody) return;
        try {
            const rooms = await fetchAPI('/rooms');
            tbody.innerHTML = '';
            rooms.forEach((r, idx) => {
                tbody.innerHTML += `
                    <tr>
                        <td><small>${r.id.substr(0,8)}...</small></td>
                        <td><strong>${r.number}</strong></td>
                        <td>${r.type}</td>
                        <td>$ ${r.price_per_night.toLocaleString()}</td>
                        <td>
                            <button class="btn-icon text-danger" title="Eliminar" onclick="deleteRoom('${r.id}')"><i class="fa-solid fa-trash" style="color:var(--danger)"></i></button>
                        </td>
                    </tr>
                `;
            });
        } catch (e) {}
    }

    async function loadGuests() {
        const tbody = document.querySelector('table tbody');
        if (!tbody) return;
        try {
            const guests = await fetchAPI('/guests');
            tbody.innerHTML = '';
            guests.forEach((g) => {
                tbody.innerHTML += `
                    <tr>
                        <td><small>${g.id.substr(0,8)}...</small></td>
                        <td><strong>${g.name}</strong></td>
                        <td>${g.doc_id}</td>
                        <td>
                            <button class="btn-icon text-danger" title="Eliminar" onclick="deleteGuest('${g.id}')"><i class="fa-solid fa-trash" style="color:var(--danger)"></i></button>
                        </td>
                    </tr>
                `;
            });
        } catch (e) {}
    }

    async function populateReservationSelects() {
        try {
            const guests = await fetchAPI('/guests');
            const rooms = await fetchAPI('/rooms');
            
            const selects = document.querySelectorAll('#newReservationModal select');
            if(selects.length >= 2) {
                const guestSel = selects[0];
                guestSel.innerHTML = '<option value="">Seleccione Huésped</option>';
                guests.forEach(g => { guestSel.innerHTML += `<option value="${g.id}">${g.name} (${g.doc_id})</option>`; });

                const roomSel = selects[1];
                roomSel.innerHTML = '<option value="">Seleccione Habitación</option>';
                rooms.forEach(r => { 
                    roomSel.innerHTML += `<option value="${r.id}" data-price="${r.price_per_night}">${r.number} - ${r.type} ($ ${r.price_per_night})</option>`; 
                });
            }
        } catch (e) {}
    }

    async function loadReservations() {
        const tbody = document.querySelector('table tbody');
        if (!tbody) return;
        try {
            const resData = await fetchAPI('/reservations');
            const rooms = await fetchAPI('/rooms'); 
            const guests = await fetchAPI('/guests');
            
            tbody.innerHTML = '';
            resData.forEach(r => {
                const room = rooms.find(rm => rm.id === r.room_id) || { number: r.room_id };
                const guest = guests.find(g => g.id === r.guest_id) || { name: r.guest_id };

                let badge = '';
                if(r.status === 'CREADA') badge = '<span class="badge badge-primary">CREADA</span>';
                if(r.status === 'CONFIRMADA') badge = '<span class="badge badge-success">CONFIRMADA</span>';
                if(r.status === 'CANCELADA') badge = '<span class="badge badge-danger">CANCELADA</span>';

                let actions = '';
                if(r.status === 'CREADA') {
                    actions = `
                        <button class="btn-icon" style="color: var(--success)" title="Confirmar" onclick="updateRes('${r.id}', 'confirm')"><i class="fa-solid fa-check"></i></button>
                        <button class="btn-icon" style="color: var(--danger)" title="Cancelar" onclick="updateRes('${r.id}', 'cancel')"><i class="fa-solid fa-ban"></i></button>
                    `;
                }

                tbody.innerHTML += `
                    <tr>
                        <td><small>${r.id.substr(0,6)}</small></td>
                        <td>${guest.name}</td>
                        <td>${room.number}</td>
                        <td>${r.check_in}</td>
                        <td>${r.check_out}</td>
                        <td>$ ${parseFloat(r.total_cost).toLocaleString()}</td>
                        <td>${badge}</td>
                        <td>${actions}</td>
                    </tr>
                `;
            });
        } catch (e) {}
    }

    window.deleteRoom = async (id) => {
        if(confirm('¿Seguro?')) {
            try { await fetchAPI(`/rooms/${id}`, 'DELETE'); loadRooms(); showAlert('Habitación eliminada','success'); } catch(e){}
        }
    };

    window.deleteGuest = async (id) => {
        if(confirm('¿Seguro?')) {
            try { await fetchAPI(`/guests/${id}`, 'DELETE'); loadGuests(); showAlert('Huésped eliminado','success');} catch(e){}
        }
    };

    window.updateRes = async (id, action) => {
        try {
            await fetchAPI(`/reservations/${id}/${action}`, 'PUT');
            loadReservations();
            showAlert(`Reserva ${action === 'confirm' ? 'Confirmada' : 'Cancelada'}`, 'success');
        } catch (e) {}
    };

    function renderAvailableRooms(data, fin, fout) {
        const tbody = document.querySelector('p + .table-container tbody');
        if(!tbody) return;
        const msg = document.querySelector('p');
        if(msg) msg.innerHTML = `Disponibles del <strong>${fin}</strong> al <strong>${fout}</strong>:`;

        tbody.innerHTML = '';
        data.forEach(r => {
             const dIn = new Date(fin); 
             const dOut = new Date(fout);
             const days = Math.ceil(Math.abs(dOut - dIn) / (1000 * 60 * 60 * 24));
             const total = (days > 0 ? days : 1) * r.price_per_night;

             tbody.innerHTML += `
              <tr>
                <td><strong>${r.number}</strong></td>
                <td>${r.type}</td>
                <td>$ ${r.price_per_night.toLocaleString()}</td>
                <td>$ ${total.toLocaleString()} (${days} noches)</td>
                <td>
                  <a href="reservaciones.html#newReservationModal" class="btn btn-primary" style="padding: 0.4rem 0.8rem; font-size: 0.8rem">
                    Ir a Reservas
                  </a>
                </td>
              </tr>
             `;
        });
    }

    let occupancyChartInstance = null;

    function renderReport(data) {
       const stats = document.querySelectorAll('.grid-2 > div[style*="column"] .card > div:first-child');
       if(stats.length >= 2) {
           stats[0].textContent = `${data.occupancy_rate.toFixed(1)}%`;
           stats[1].textContent = `$ ${data.total_revenue.toLocaleString()}`;
       }
       
       const tbody = document.querySelector('.table-container tbody');
       if(tbody) {
           tbody.innerHTML = '';
           data.room_breakdown.forEach(item => {
               const room = item.room;
               const rate = data.total_nights_possible > 0 ? (item.nights / (data.total_nights_possible / data.room_breakdown.length) * 100).toFixed(1) : 0;
               
               tbody.innerHTML += `
                   <tr>
                       <td><strong>${room.number}</strong> (${room.type})</td>
                       <td>${item.nights}</td>
                       <td>${(data.total_nights_possible / data.room_breakdown.length) - item.nights}</td>
                       <td>
                          <div style="display: flex; align-items: center; gap: 10px">
                             <div style="flex: 1; height: 8px; background: #eee; border-radius: 4px; overflow: hidden;">
                                <div style="height: 100%; width: ${rate}%; background: var(--warning);"></div>
                             </div>
                             <span style="font-size: 0.85rem; font-weight: 600">${rate}%</span>
                          </div>
                       </td>
                       <td>$ ${item.revenue.toLocaleString()}</td>
                   </tr>
               `;
           });
       }

       
       const canvas = document.getElementById('occupancyChart');
       if (canvas && window.Chart) {
            if (occupancyChartInstance) {
                occupancyChartInstance.destroy();
            }
            
            const labels = [];
            const occupancies = [];
            
            data.room_breakdown.forEach(item => {
                labels.push(`${item.room.number} (${item.room.type})`);
                let rate = (data.total_nights_possible > 0) ? (item.nights / (data.total_nights_possible / data.room_breakdown.length) * 100).toFixed(1) : 0;
                occupancies.push(parseFloat(rate));
            });

            occupancyChartInstance = new Chart(canvas, {
                type: 'bar',
                data: {
                    labels: labels,
                    datasets: [{
                        label: 'Nivel de Ocupación (%)',
                        data: occupancies,
                        backgroundColor: '#4361ee',
                        borderRadius: 4
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        y: { beginAtZero: true, max: 100 }
                    }
                }
            });
       }
    }

    async function loadDashboardStats() {
       try {
           const rooms = await fetchAPI('/rooms');
           const guests = await fetchAPI('/guests');
           const res = await fetchAPI('/reservations');

           const actives = res.filter(r => r.status === 'CONFIRMADA').length;
           const cancels = res.filter(r => r.status === 'CANCELADA').length;

           const statsHTML = document.querySelectorAll('.stat-info h3');
           if (statsHTML.length >= 4) {
               statsHTML[0].textContent = rooms.length;
               statsHTML[1].textContent = actives;
               statsHTML[2].textContent = guests.length; 
               statsHTML[3].textContent = cancels;
           }

           const tb = document.querySelector('.table-container tbody');
           if (tb) {
               tb.innerHTML = '';
               
               res.slice(-5).reverse().forEach(r => {
                    const room = rooms.find(rm => rm.id === r.room_id) || { number: r.room_id };
                    const guest = guests.find(g => g.id === r.guest_id) || { name: r.guest_id };
                    const bColor = r.status==='CREADA'?'primary':(r.status==='CONFIRMADA'?'success':'danger');
                    tb.innerHTML += `
                        <tr>
                            <td><small>${r.id.substr(0,6)}</small></td>
                            <td>${guest.name}</td>
                            <td>${room.number}</td>
                            <td><span class="badge badge-${bColor}">${r.status}</span></td>
                        </tr>
                    `;
               });
           }
       } catch (e) {}
    }

});
