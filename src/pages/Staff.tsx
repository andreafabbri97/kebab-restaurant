import { useEffect, useState } from 'react';
import {
  Plus,
  Users,
  Calendar,
  DollarSign,
  Edit2,
  Trash2,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import {
  getEmployees,
  getWorkShifts,
  createEmployee,
  updateEmployee,
  deleteEmployee,
  createWorkShift,
} from '../lib/database';
import { showToast } from '../components/ui/Toast';
import { Modal } from '../components/ui/Modal';
import type { Employee, WorkShift } from '../types';

export function Staff() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [shifts, setShifts] = useState<WorkShift[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentWeek, setCurrentWeek] = useState(getWeekDates(new Date()));

  // Modal states
  const [showEmployeeModal, setShowEmployeeModal] = useState(false);
  const [showShiftModal, setShowShiftModal] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);

  // Form states
  const [employeeForm, setEmployeeForm] = useState({
    name: '',
    role: '',
    hourly_rate: '',
    phone: '',
    email: '',
    active: true,
  });
  const [shiftForm, setShiftForm] = useState({
    employee_id: 0,
    date: new Date().toISOString().split('T')[0],
    start_time: '09:00',
    end_time: '17:00',
    shift_type: 'worked' as const,
    notes: '',
  });

  function getWeekDates(date: Date) {
    const week = [];
    const start = new Date(date);
    start.setDate(start.getDate() - start.getDay() + 1); // Monday

    for (let i = 0; i < 7; i++) {
      const day = new Date(start);
      day.setDate(start.getDate() + i);
      week.push(day.toISOString().split('T')[0]);
    }
    return week;
  }

  function changeWeek(delta: number) {
    const newDate = new Date(currentWeek[0]);
    newDate.setDate(newDate.getDate() + delta * 7);
    setCurrentWeek(getWeekDates(newDate));
  }

  useEffect(() => {
    loadData();
  }, [currentWeek]);

  async function loadData() {
    try {
      const [emps, sh] = await Promise.all([
        getEmployees(),
        getWorkShifts(currentWeek[0], currentWeek[6]),
      ]);
      setEmployees(emps);
      setShifts(sh);
    } catch (error) {
      console.error('Error loading data:', error);
      showToast('Errore nel caricamento dati', 'error');
    } finally {
      setLoading(false);
    }
  }

  function openEmployeeModal(employee?: Employee) {
    if (employee) {
      setEditingEmployee(employee);
      setEmployeeForm({
        name: employee.name,
        role: employee.role,
        hourly_rate: employee.hourly_rate.toString(),
        phone: employee.phone || '',
        email: employee.email || '',
        active: employee.active,
      });
    } else {
      setEditingEmployee(null);
      setEmployeeForm({
        name: '',
        role: '',
        hourly_rate: '',
        phone: '',
        email: '',
        active: true,
      });
    }
    setShowEmployeeModal(true);
  }

  function openShiftModal(employeeId?: number, date?: string) {
    setShiftForm({
      employee_id: employeeId || employees[0]?.id || 0,
      date: date || new Date().toISOString().split('T')[0],
      start_time: '09:00',
      end_time: '17:00',
      shift_type: 'worked',
      notes: '',
    });
    setShowShiftModal(true);
  }

  async function handleSaveEmployee() {
    if (!employeeForm.name.trim() || !employeeForm.role.trim()) {
      showToast('Compila nome e ruolo', 'warning');
      return;
    }

    try {
      const data = {
        name: employeeForm.name.trim(),
        role: employeeForm.role.trim(),
        hourly_rate: parseFloat(employeeForm.hourly_rate) || 10,
        phone: employeeForm.phone || undefined,
        email: employeeForm.email || undefined,
        active: employeeForm.active,
      };

      if (editingEmployee) {
        await updateEmployee(editingEmployee.id, data);
        showToast('Dipendente aggiornato', 'success');
      } else {
        await createEmployee(data as Omit<Employee, 'id'>);
        showToast('Dipendente aggiunto', 'success');
      }

      setShowEmployeeModal(false);
      loadData();
    } catch (error) {
      console.error('Error saving employee:', error);
      showToast('Errore nel salvataggio', 'error');
    }
  }

  async function handleDeleteEmployee(id: number) {
    if (!confirm('Sei sicuro di voler eliminare questo dipendente?')) return;

    try {
      await deleteEmployee(id);
      showToast('Dipendente eliminato', 'success');
      loadData();
    } catch (error) {
      console.error('Error deleting employee:', error);
      showToast('Errore nell\'eliminazione', 'error');
    }
  }

  async function handleSaveShift() {
    if (!shiftForm.employee_id) {
      showToast('Seleziona un dipendente', 'warning');
      return;
    }

    try {
      const startHour = parseInt(shiftForm.start_time.split(':')[0]);
      const endHour = parseInt(shiftForm.end_time.split(':')[0]);
      const startMin = parseInt(shiftForm.start_time.split(':')[1]) / 60;
      const endMin = parseInt(shiftForm.end_time.split(':')[1]) / 60;
      const hoursWorked = (endHour + endMin) - (startHour + startMin);

      await createWorkShift({
        employee_id: shiftForm.employee_id,
        date: shiftForm.date,
        hours_worked: hoursWorked,
        status: 'scheduled',
        shift_type: shiftForm.shift_type,
        notes: shiftForm.notes || undefined,
        start_time: shiftForm.start_time,
        end_time: shiftForm.end_time,
      });

      showToast('Turno aggiunto', 'success');
      setShowShiftModal(false);
      loadData();
    } catch (error) {
      console.error('Error saving shift:', error);
      showToast('Errore nel salvataggio', 'error');
    }
  }

  function getShiftForDay(employeeId: number, date: string): WorkShift | undefined {
    return shifts.find(s => s.employee_id === employeeId && s.date === date);
  }

  const weekDays = ['Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab', 'Dom'];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Personale</h1>
          <p className="text-dark-400 mt-1">Gestisci dipendenti e turni</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => openShiftModal()} className="btn-secondary">
            <Calendar className="w-5 h-5" />
            Nuovo Turno
          </button>
          <button onClick={() => openEmployeeModal()} className="btn-primary">
            <Plus className="w-5 h-5" />
            Nuovo Dipendente
          </button>
        </div>
      </div>

      {/* Employees List */}
      <div className="card">
        <div className="card-header">
          <h2 className="font-semibold text-white flex items-center gap-2">
            <Users className="w-5 h-5" />
            Dipendenti
          </h2>
        </div>
        <div className="card-body">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {employees.map((emp) => (
              <div
                key={emp.id}
                className={`bg-dark-900 rounded-xl p-4 ${!emp.active ? 'opacity-50' : ''}`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-white">{emp.name}</h3>
                    <p className="text-sm text-primary-400">{emp.role}</p>
                    <div className="flex items-center gap-1 mt-2 text-sm text-dark-400">
                      <DollarSign className="w-4 h-4" />
                      €{emp.hourly_rate.toFixed(2)}/ora
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEmployeeModal(emp)}
                      className="p-2 hover:bg-dark-700 rounded-lg transition-colors"
                    >
                      <Edit2 className="w-4 h-4 text-dark-400" />
                    </button>
                    <button
                      onClick={() => handleDeleteEmployee(emp.id)}
                      className="p-2 hover:bg-red-500/20 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4 text-red-400" />
                    </button>
                  </div>
                </div>
                {!emp.active && (
                  <span className="badge-danger mt-2">Inattivo</span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Weekly Schedule */}
      <div className="card">
        <div className="card-header flex items-center justify-between">
          <h2 className="font-semibold text-white flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Turni Settimanali
          </h2>
          <div className="flex items-center gap-2">
            <button
              onClick={() => changeWeek(-1)}
              className="p-2 hover:bg-dark-700 rounded-lg transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <span className="text-sm text-dark-300">
              {new Date(currentWeek[0]).toLocaleDateString('it-IT', { day: 'numeric', month: 'short' })}
              {' - '}
              {new Date(currentWeek[6]).toLocaleDateString('it-IT', { day: 'numeric', month: 'short' })}
            </span>
            <button
              onClick={() => changeWeek(1)}
              className="p-2 hover:bg-dark-700 rounded-lg transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-dark-300 uppercase tracking-wider bg-dark-900 sticky left-0">
                  Dipendente
                </th>
                {currentWeek.map((date, index) => (
                  <th
                    key={date}
                    className="px-4 py-3 text-center text-xs font-semibold text-dark-300 uppercase tracking-wider bg-dark-900"
                  >
                    <div>{weekDays[index]}</div>
                    <div className="text-dark-500 font-normal">
                      {new Date(date).getDate()}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {employees.filter(e => e.active).map((emp) => (
                <tr key={emp.id} className="border-b border-dark-700">
                  <td className="px-4 py-3 sticky left-0 bg-dark-800">
                    <p className="font-medium text-white">{emp.name}</p>
                    <p className="text-xs text-dark-400">{emp.role}</p>
                  </td>
                  {currentWeek.map((date) => {
                    const shift = getShiftForDay(emp.id, date);
                    return (
                      <td key={date} className="px-2 py-2 text-center">
                        {shift ? (
                          <div
                            className={`p-2 rounded-lg text-xs ${
                              shift.shift_type === 'worked'
                                ? 'bg-emerald-500/20 text-emerald-400'
                                : shift.shift_type === 'sick'
                                ? 'bg-red-500/20 text-red-400'
                                : shift.shift_type === 'vacation'
                                ? 'bg-blue-500/20 text-blue-400'
                                : 'bg-amber-500/20 text-amber-400'
                            }`}
                          >
                            <div className="font-medium">
                              {shift.start_time} - {shift.end_time}
                            </div>
                            <div className="text-[10px] opacity-75">
                              {shift.hours_worked}h
                            </div>
                          </div>
                        ) : (
                          <button
                            onClick={() => openShiftModal(emp.id, date)}
                            className="w-full p-2 rounded-lg border-2 border-dashed border-dark-600 hover:border-primary-500 hover:bg-dark-700 transition-colors text-dark-500 hover:text-primary-400"
                          >
                            <Plus className="w-4 h-4 mx-auto" />
                          </button>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Employee Modal */}
      <Modal
        isOpen={showEmployeeModal}
        onClose={() => setShowEmployeeModal(false)}
        title={editingEmployee ? 'Modifica Dipendente' : 'Nuovo Dipendente'}
        size="md"
      >
        <div className="space-y-4">
          <div>
            <label className="label">Nome *</label>
            <input
              type="text"
              value={employeeForm.name}
              onChange={(e) => setEmployeeForm({ ...employeeForm, name: e.target.value })}
              className="input"
              placeholder="Nome completo"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Ruolo *</label>
              <input
                type="text"
                value={employeeForm.role}
                onChange={(e) => setEmployeeForm({ ...employeeForm, role: e.target.value })}
                className="input"
                placeholder="Es. Cuoco"
              />
            </div>
            <div>
              <label className="label">Tariffa Oraria (€)</label>
              <input
                type="number"
                step="0.01"
                value={employeeForm.hourly_rate}
                onChange={(e) => setEmployeeForm({ ...employeeForm, hourly_rate: e.target.value })}
                className="input"
                placeholder="10.00"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Telefono</label>
              <input
                type="tel"
                value={employeeForm.phone}
                onChange={(e) => setEmployeeForm({ ...employeeForm, phone: e.target.value })}
                className="input"
                placeholder="+39..."
              />
            </div>
            <div>
              <label className="label">Email</label>
              <input
                type="email"
                value={employeeForm.email}
                onChange={(e) => setEmployeeForm({ ...employeeForm, email: e.target.value })}
                className="input"
                placeholder="email@esempio.com"
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-white">Attivo</span>
            <button
              type="button"
              onClick={() => setEmployeeForm({ ...employeeForm, active: !employeeForm.active })}
              className={`relative w-14 h-8 rounded-full transition-colors ${
                employeeForm.active ? 'bg-emerald-500' : 'bg-dark-600'
              }`}
            >
              <span
                className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-transform ${
                  employeeForm.active ? 'left-7' : 'left-1'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center gap-3 pt-4">
            <button onClick={handleSaveEmployee} className="btn-primary flex-1">
              {editingEmployee ? 'Salva' : 'Aggiungi'}
            </button>
            <button onClick={() => setShowEmployeeModal(false)} className="btn-secondary">
              Annulla
            </button>
          </div>
        </div>
      </Modal>

      {/* Shift Modal */}
      <Modal
        isOpen={showShiftModal}
        onClose={() => setShowShiftModal(false)}
        title="Nuovo Turno"
        size="md"
      >
        <div className="space-y-4">
          <div>
            <label className="label">Dipendente *</label>
            <select
              value={shiftForm.employee_id}
              onChange={(e) => setShiftForm({ ...shiftForm, employee_id: parseInt(e.target.value) })}
              className="select"
            >
              {employees.filter(e => e.active).map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.name} - {emp.role}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="label">Data *</label>
            <input
              type="date"
              value={shiftForm.date}
              onChange={(e) => setShiftForm({ ...shiftForm, date: e.target.value })}
              className="input"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Inizio</label>
              <input
                type="time"
                value={shiftForm.start_time}
                onChange={(e) => setShiftForm({ ...shiftForm, start_time: e.target.value })}
                className="input"
              />
            </div>
            <div>
              <label className="label">Fine</label>
              <input
                type="time"
                value={shiftForm.end_time}
                onChange={(e) => setShiftForm({ ...shiftForm, end_time: e.target.value })}
                className="input"
              />
            </div>
          </div>

          <div>
            <label className="label">Tipo Turno</label>
            <select
              value={shiftForm.shift_type}
              onChange={(e) => setShiftForm({ ...shiftForm, shift_type: e.target.value as any })}
              className="select"
            >
              <option value="worked">Lavorativo</option>
              <option value="vacation">Ferie</option>
              <option value="sick">Malattia</option>
              <option value="other">Altro</option>
            </select>
          </div>

          <div>
            <label className="label">Note</label>
            <textarea
              value={shiftForm.notes}
              onChange={(e) => setShiftForm({ ...shiftForm, notes: e.target.value })}
              className="input resize-none h-20"
              placeholder="Note opzionali..."
            />
          </div>

          <div className="flex items-center gap-3 pt-4">
            <button onClick={handleSaveShift} className="btn-primary flex-1">
              Salva Turno
            </button>
            <button onClick={() => setShowShiftModal(false)} className="btn-secondary">
              Annulla
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
