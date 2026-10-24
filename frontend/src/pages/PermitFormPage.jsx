import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { createPermit, getPermitById, updatePermit } from '../services/permitService';

const emptyPermit = {
  permit_no: '', 
  permit_type: '', 
  issue_date: '', 
  expiry_date: '', 
  worker_name: '',
  iqama_no: '', 
  nationality: '', 
  job_title: '', 
  gender: 'ذكر', 
  date_of_birth: '',
  iqama_mosasa_number: '', 
  iqama_mosasa: '', 
  company_name: '', 

  status: true,
};

const PermitFormPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [form, setForm] = useState(emptyPermit);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!id) return;
    getPermitById(id)
      .then((permit) => setForm({ ...emptyPermit, ...permit }))
      .catch((loadError) => setError(loadError.response?.data?.message || 'Could not load permit.'));
  }, [id]);

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    setForm((current) => ({ ...current, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError('');
    try {
      if (id) await updatePermit(id, form);
      else await createPermit(form);
      navigate('/dashboard', { replace: true });
    } catch (saveError) {
      setError(saveError.response?.data?.message || 'Could not save permit.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#f2f5f2] px-4 py-8 text-[#18332d] sm:px-8 sm:py-11">
      <section className="mx-auto max-w-[1000px] rounded-lg border border-[#dce5df] bg-white p-5 sm:p-9">
        <p className="mb-1 text-xs font-extrabold text-[#17745b]">AJEER ADMIN</p>
        <h1 className="mb-7 mt-0 text-3xl font-extrabold">{id ? 'Edit permit' : 'Add permit'}</h1>
        
        {error && (
          <p className="mb-4 rounded-md bg-[#fff0ed] px-3 py-2.5 text-sm font-semibold text-[#a33326]" role="alert">
            {error}
          </p>
        )}

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5">
            
            {/* 1. Permit Number */}
            <label className="block min-w-0 text-sm font-bold text-[#385249]">
              <span className="mb-2 block">Permit number *</span>
              <input 
                type="text" 
                name="permit_no" 
                value={form.permit_no || ''} 
                onChange={handleChange} 
                required 
                className="min-h-11 w-full rounded-md border border-[#cbd6d0] bg-white px-3 py-2 text-[#18332d] outline-none transition focus:border-[#17745b] focus:ring-2 focus:ring-[#17745b]/20" 
              />
            </label>

            {/* 2. Permit Type */}
            <label className="block min-w-0 text-sm font-bold text-[#385249]">
              <span className="mb-2 block">Permit type</span>
              <input 
                type="text" 
                name="permit_type" 
                value={form.permit_type || ''} 
                onChange={handleChange} 
                className="min-h-11 w-full rounded-md border border-[#cbd6d0] bg-white px-3 py-2 text-[#18332d] outline-none transition focus:border-[#17745b] focus:ring-2 focus:ring-[#17745b]/20" 
              />
            </label>

            {/* 3. Issue Date */}
            <label className="block min-w-0 text-sm font-bold text-[#385249]">
              <span className="mb-2 block">Issue date</span>
              <input 
                type="text" 
                name="issue_date" 
                value={form.issue_date || ''} 
                onChange={handleChange} 
                placeholder="DD-MM-YYYY" 
                className="min-h-11 w-full rounded-md border border-[#cbd6d0] bg-white px-3 py-2 text-[#18332d] outline-none transition focus:border-[#17745b] focus:ring-2 focus:ring-[#17745b]/20" 
              />
            </label>

            {/* 4. Expiry Date */}
            <label className="block min-w-0 text-sm font-bold text-[#385249]">
              <span className="mb-2 block">Expiry date</span>
              <input 
                type="text" 
                name="expiry_date" 
                value={form.expiry_date || ''} 
                onChange={handleChange} 
                placeholder="DD-MM-YYYY" 
                className="min-h-11 w-full rounded-md border border-[#cbd6d0] bg-white px-3 py-2 text-[#18332d] outline-none transition focus:border-[#17745b] focus:ring-2 focus:ring-[#17745b]/20" 
              />
            </label>

            {/* 5. Worker Name */}
            <label className="block min-w-0 text-sm font-bold text-[#385249]">
              <span className="mb-2 block">Worker name *</span>
              <input 
                type="text" 
                name="worker_name" 
                value={form.worker_name || ''} 
                onChange={handleChange} 
                required 
                className="min-h-11 w-full rounded-md border border-[#cbd6d0] bg-white px-3 py-2 text-[#18332d] outline-none transition focus:border-[#17745b] focus:ring-2 focus:ring-[#17745b]/20" 
              />
            </label>

            {/* 6. Iqama / ID Number */}
            <label className="block min-w-0 text-sm font-bold text-[#385249]">
              <span className="mb-2 block">Iqama / ID number *</span>
              <input 
                type="text" 
                name="iqama_no" 
                value={form.iqama_no || ''} 
                onChange={handleChange} 
                required 
                className="min-h-11 w-full rounded-md border border-[#cbd6d0] bg-white px-3 py-2 text-[#18332d] outline-none transition focus:border-[#17745b] focus:ring-2 focus:ring-[#17745b]/20" 
              />
            </label>

            {/* 7. Nationality */}
            <label className="block min-w-0 text-sm font-bold text-[#385249]">
              <span className="mb-2 block">Nationality</span>
              <input 
                type="text" 
                name="nationality" 
                value={form.nationality || ''} 
                onChange={handleChange} 
                className="min-h-11 w-full rounded-md border border-[#cbd6d0] bg-white px-3 py-2 text-[#18332d] outline-none transition focus:border-[#17745b] focus:ring-2 focus:ring-[#17745b]/20" 
              />
            </label>

            {/* 8. Job Title */}
            <label className="block min-w-0 text-sm font-bold text-[#385249]">
              <span className="mb-2 block">Job title</span>
              <input 
                type="text" 
                name="job_title" 
                value={form.job_title || ''} 
                onChange={handleChange} 
                className="min-h-11 w-full rounded-md border border-[#cbd6d0] bg-white px-3 py-2 text-[#18332d] outline-none transition focus:border-[#17745b] focus:ring-2 focus:ring-[#17745b]/20" 
              />
            </label>

            {/* 9. Date of Birth */}
            <label className="block min-w-0 text-sm font-bold text-[#385249]">
              <span className="mb-2 block">Date of birth</span>
              <input 
                type="text" 
                name="date_of_birth" 
                value={form.date_of_birth || ''} 
                onChange={handleChange} 
                placeholder="DD-MM-YYYY" 
                className="min-h-11 w-full rounded-md border border-[#cbd6d0] bg-white px-3 py-2 text-[#18332d] outline-none transition focus:border-[#17745b] focus:ring-2 focus:ring-[#17745b]/20" 
              />
            </label>

            {/* 10. Iqama Mosasa Number */}
            <label className="block min-w-0 text-sm font-bold text-[#385249]">
              <span className="mb-2 block">Iqama Mosasa number</span>
              <input 
                type="text" 
                name="iqama_mosasa_number" 
                value={form.iqama_mosasa_number || ''} 
                onChange={handleChange} 
                className="min-h-11 w-full rounded-md border border-[#cbd6d0] bg-white px-3 py-2 text-[#18332d] outline-none transition focus:border-[#17745b] focus:ring-2 focus:ring-[#17745b]/20" 
              />
            </label>

            {/* 11. Iqama Mosasa */}
            <label className="block min-w-0 text-sm font-bold text-[#385249]">
              <span className="mb-2 block">Iqama Mosasa</span>
              <input 
                type="text" 
                name="iqama_mosasa" 
                value={form.iqama_mosasa || ''} 
                onChange={handleChange} 
                className="min-h-11 w-full rounded-md border border-[#cbd6d0] bg-white px-3 py-2 text-[#18332d] outline-none transition focus:border-[#17745b] focus:ring-2 focus:ring-[#17745b]/20" 
              />
            </label>

            {/* 12. Establishment Name / اسم المنشأة */}
            <label className="block min-w-0 text-sm font-bold text-[#385249]">
              <span className="mb-2 block">Establishment Name / اسم المنشأة</span>
              <input 
                type="text" 
                name="company_name" 
                value={form.company_name || ''} 
                onChange={handleChange} 
                className="min-h-11 w-full rounded-md border border-[#cbd6d0] bg-white px-3 py-2 text-[#18332d] outline-none transition focus:border-[#17745b] focus:ring-2 focus:ring-[#17745b]/20" 
              />
            </label>

            {/* Gender Radio Buttons */}
            <fieldset className="flex min-w-0 items-center gap-4 border-0 p-0">
              <legend className="mr-1 text-sm font-bold text-[#385249]">Gender</legend>
              {['ذكر', 'أنثى'].map((gender) => (
                <label className="inline-flex items-center gap-2 text-sm text-[#385249]" key={gender}>
                  <input 
                    className="accent-[#17745b]" 
                    type="radio" 
                    name="gender" 
                    value={gender} 
                    checked={form.gender === gender} 
                    onChange={handleChange} 
                  /> 
                  {gender}
                </label>
              ))}
            </fieldset>

            {/* Active Status Checkbox */}
            <label className="inline-flex items-center gap-2 text-sm font-semibold text-[#385249]">
              <input 
                className="accent-[#17745b]" 
                type="checkbox" 
                name="status" 
                checked={Boolean(form.status)} 
                onChange={handleChange} 
              /> 
              Active immediately
            </label>

          </div>

          <button 
            className="mt-6 min-h-11 min-w-[150px] rounded-md bg-[#17745b] px-4 py-2 font-bold text-white transition hover:bg-[#105c48] disabled:cursor-wait disabled:opacity-60" 
            type="submit" 
            disabled={saving}
          >
            {saving ? 'Saving…' : id ? 'Save changes' : 'Save permit'}
          </button>
        </form>
      </section>
    </main>
  );
};

export default PermitFormPage;