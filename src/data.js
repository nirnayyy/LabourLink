/* LabourLink — Seed / mock data
   Initialised into localStorage on first visit. */

export const initialData = {
  areas: ['Knowledge Park', 'Kasna', 'Greater Noida West', 'Sector 62'],

  workTypes: [
    'General Helper',
    'Digger (Beldar)',
    'Loader / Unloader',
    'Cleaning Help',
    'Shifting / Moving',
    'Painting',
    'Plumbing',
    'Electrical',
  ],

  wages: [
    { work_type: 'General Helper', min_wage: 400, max_wage: 600 },
    { work_type: 'Digger (Beldar)', min_wage: 500, max_wage: 700 },
    { work_type: 'Loader / Unloader', min_wage: 500, max_wage: 700 },
    { work_type: 'Cleaning Help', min_wage: 350, max_wage: 550 },
    { work_type: 'Shifting / Moving', min_wage: 500, max_wage: 800 },
    { work_type: 'Painting', min_wage: 600, max_wage: 900 },
    { work_type: 'Plumbing', min_wage: 500, max_wage: 800 },
    { work_type: 'Electrical', min_wage: 600, max_wage: 1000 },
  ],

  workers: [
    {
      id: 'w1',
      name: 'Aarav Kumar',
      phone: '9876543210',
      area: 'Knowledge Park',
      locality: 'Near Omega 1',
      photo_url: '/assets/worker1.jpeg',
      work_types: ['General Helper', 'Loader / Unloader', 'Shifting / Moving'],
      availability_status: 'available',
      rating_avg: 4.6,
      total_reviews: 12,
      total_jobs: 34,
      reliability_score: 92,
      registered_by: 'LabourLink team',
      is_blacklisted: false,
      is_published: true,
      created_at: '2026-03-15T10:00:00Z',
    },
    {
      id: 'w2',
      name: 'Rajesh Yadav',
      phone: '9876543211',
      area: 'Kasna',
      locality: 'Kasna Industrial Area',
      photo_url: '/assets/worker2.jpeg',
      work_types: ['Digger (Beldar)', 'General Helper'],
      availability_status: 'available',
      rating_avg: 4.3,
      total_reviews: 8,
      total_jobs: 21,
      reliability_score: 88,
      registered_by: 'LabourLink team',
      is_blacklisted: false,
      is_published: true,
      created_at: '2026-03-20T10:00:00Z',
    },
    {
      id: 'w3',
      name: 'Sunita Devi',
      phone: '9876543212',
      area: 'Greater Noida West',
      locality: 'Gaur City',
      photo_url: '/assets/worker3.jpeg',
      work_types: ['Cleaning Help', 'General Helper'],
      availability_status: 'working',
      rating_avg: 4.8,
      total_reviews: 15,
      total_jobs: 40,
      reliability_score: 96,
      registered_by: 'LabourLink team',
      is_blacklisted: false,
      is_published: true,
      created_at: '2026-02-10T10:00:00Z',
    },
    {
      id: 'w4',
      name: 'Mohan Lal',
      phone: '9876543213',
      area: 'Sector 62',
      locality: 'Near Noida Expressway',
      photo_url: '/assets/worker1.jpeg',
      work_types: ['Painting', 'Plumbing', 'Electrical'],
      availability_status: 'available',
      rating_avg: 4.1,
      total_reviews: 6,
      total_jobs: 15,
      reliability_score: 82,
      registered_by: 'LabourLink team',
      is_blacklisted: false,
      is_published: true,
      created_at: '2026-04-01T10:00:00Z',
    },
    {
      id: 'w5',
      name: 'Priya Sharma',
      phone: '9876543214',
      area: 'Knowledge Park',
      locality: 'Knowledge Park 3',
      photo_url: '/assets/worker2.jpeg',
      work_types: ['Cleaning Help', 'Shifting / Moving'],
      availability_status: 'unavailable',
      rating_avg: 4.5,
      total_reviews: 10,
      total_jobs: 28,
      reliability_score: 90,
      registered_by: 'LabourLink team',
      is_blacklisted: false,
      is_published: true,
      created_at: '2026-03-01T10:00:00Z',
    },
    {
      id: 'w6',
      name: 'Vikram Singh',
      phone: '9876543215',
      area: 'Kasna',
      locality: 'Alpha Commercial Belt',
      photo_url: '/assets/worker3.jpeg',
      work_types: ['Loader / Unloader', 'Shifting / Moving', 'General Helper'],
      availability_status: 'available',
      rating_avg: 4.7,
      total_reviews: 18,
      total_jobs: 52,
      reliability_score: 95,
      registered_by: 'LabourLink team',
      is_blacklisted: false,
      is_published: true,
      created_at: '2026-01-20T10:00:00Z',
    },
  ],

  reviews: [
    {
      id: 'r1',
      worker_id: 'w1',
      hirer_name: 'Anil Mehta',
      rating: 5,
      comment: 'Aarav was punctual and did an excellent job shifting our furniture. Will hire again!',
      status: 'published',
      created_at: '2026-05-10T14:00:00Z',
    },
    {
      id: 'r2',
      worker_id: 'w1',
      hirer_name: 'Sneha Gupta',
      rating: 4,
      comment: 'Good work overall. Arrived on time and was very respectful.',
      status: 'published',
      created_at: '2026-05-15T10:00:00Z',
    },
    {
      id: 'r3',
      worker_id: 'w3',
      hirer_name: 'Rahul Verma',
      rating: 5,
      comment: 'Sunita is the best cleaning help we have ever had. Highly reliable and thorough.',
      status: 'published',
      created_at: '2026-04-20T08:00:00Z',
    },
    {
      id: 'r4',
      worker_id: 'w6',
      hirer_name: 'Pradeep Sharma',
      rating: 5,
      comment: 'Vikram handled a heavy shifting job with ease. Very strong and trustworthy.',
      status: 'published',
      created_at: '2026-06-01T12:00:00Z',
    },
    {
      id: 'r5',
      worker_id: 'w2',
      hirer_name: 'Kavita Rani',
      rating: 4,
      comment: 'Rajesh did good digging work for our construction site.',
      status: 'pending',
      created_at: '2026-06-20T09:00:00Z',
    },
  ],

  requests: [
    {
      id: 'req1',
      ref_code: 'LL-100001',
      hirer_name: 'Anil Mehta',
      hirer_phone: '9998887770',
      hirer_email: 'hirer@labourlink.com',
      area: 'Knowledge Park',
      location: 'PG near Sector 36, Gate 2',
      work_type: 'Shifting / Moving',
      num_workers: 1,
      job_date: '2026-06-28',
      wage_offered: 600,
      notes: 'Need help shifting from 2nd floor flat',
      status: 'completed',
      created_at: '2026-06-25T10:00:00Z',
      offers: [
        {
          id: 'o1',
          worker_id: 'w1',
          worker_name: 'Aarav Kumar',
          wage: 600,
          status: 'agreed',
          history: [{ sender: 'hirer', wage: 600 }]
        }
      ],
      agreed_worker_id: 'w1',
      agreed_wage: 600,
      is_unlocked: true
    },
    {
      id: 'req2',
      ref_code: 'LL-100002',
      hirer_name: 'Sneha Gupta',
      hirer_phone: '9998887771',
      hirer_email: 'hirer@labourlink.com',
      area: 'Greater Noida West',
      location: 'Gaur City, Tower 10',
      work_type: 'Cleaning Help',
      num_workers: 1,
      job_date: '2026-07-01',
      wage_offered: 400,
      notes: 'Need full apartment deep cleaning',
      status: 'pending',
      created_at: '2026-06-28T14:00:00Z',
      offers: [
        {
          id: 'o2',
          worker_id: 'w3',
          worker_name: 'Sunita Devi',
          wage: 480,
          status: 'pending',
          history: [
            { sender: 'hirer', wage: 400 },
            { sender: 'worker', wage: 500 },
            { sender: 'hirer', wage: 450 },
            { sender: 'worker', wage: 480 }
          ]
        }
      ],
      agreed_worker_id: null,
      agreed_wage: null,
      is_unlocked: false
    },
    {
      id: 'req3',
      ref_code: 'LL-100003',
      hirer_name: 'Rahul Verma',
      hirer_phone: '9998887772',
      hirer_email: 'hirer@labourlink.com',
      area: 'Kasna',
      location: 'Kasna Industrial Area, Plot 5',
      work_type: 'Loader / Unloader',
      num_workers: 1,
      job_date: '2026-07-02',
      wage_offered: 700,
      notes: 'Heavy machinery parts — bring gloves',
      status: 'confirmed',
      created_at: '2026-06-27T08:00:00Z',
      offers: [
        {
          id: 'o3',
          worker_id: 'w6',
          worker_name: 'Vikram Singh',
          wage: 700,
          status: 'agreed',
          history: [{ sender: 'hirer', wage: 700 }]
        }
      ],
      agreed_worker_id: 'w6',
      agreed_wage: 700,
      is_unlocked: true
    },
  ],

  bookings: [
    {
      id: 'b1',
      job_request_id: 'req1',
      worker_id: 'w1',
      status: 'completed',
      confirmed_at: '2026-06-26T18:00:00Z',
      completed_at: '2026-06-28T17:00:00Z',
    },
    {
      id: 'b2',
      job_request_id: 'req3',
      worker_id: 'w6',
      status: 'confirmed',
      confirmed_at: '2026-06-27T19:00:00Z',
      completed_at: null,
    },
  ],

  /* Pre-registered accounts for testing.
     In production these would live in Supabase Auth. */
  users: [
    {
      id: 'u-admin',
      email: 'admin@labourlink.com',
      password: 'admin123',
      name: 'Admin Nirnay',
      phone: '9888777666',
      role: 'admin',
    },
    {
      id: 'u-hirer1',
      email: 'hirer@labourlink.com',
      password: 'hirer123',
      name: 'Anil Mehta',
      phone: '9998887770',
      role: 'hirer',
    },
    {
      id: 'u-labour1',
      email: 'aarav@labourlink.com',
      password: 'labour123',
      name: 'Aarav Kumar',
      phone: '9876543210',
      role: 'labour',
      worker_id: 'w1',
    },
    {
      id: 'u-labour2',
      email: 'sunita@labourlink.com',
      password: 'labour123',
      name: 'Sunita Devi',
      phone: '9876543212',
      role: 'labour',
      worker_id: 'w3',
    },
  ],
};

/* ---------- localStorage helpers ---------- */
const STORAGE_PREFIX = 'labourlink_';

export function loadState(key, fallback) {
  try {
    const raw = localStorage.getItem(STORAGE_PREFIX + key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

export function saveState(key, value) {
  localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(value));
}

/* Generate a unique-ish ID */
export function uid(prefix = '') {
  return prefix + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

/* Generate a reference code like LL-100004 */
let _refSeq = 100004;
export function nextRef() {
  return 'LL-' + (_refSeq++);
}

/* Helper functions ported from original LL namespace */
export function stars(n) {
  n = Math.round(Number(n) || 0);
  return '★★★★★☆☆☆☆☆'.slice(5 - n, 10 - n);
}

export function money(v) {
  return v == null ? '—' : '₹' + Number(v).toLocaleString('en-IN');
}

export function fmtDate(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}
