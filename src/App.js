import React, { useEffect, useMemo, useState } from "react";

/* ======= MOCK DATA (initial) ======= */
const USERS = {
  student: {
    id: "202100121",
    name: "Dana Alzahid",
    role: "student",
    program: "B.Sc. MIS",
    term: "Fall 2025",
    completed: ["MATH101", "CS101", "STAT101", "ENG101"],
    inProgress: ["PHYS101"],
    degreePlanPriority: ["DB200", "OOP200", "IA200", "MGT300", "ECON201", "ENT300"],
  },
  advisor: { id: "A-001", name: "Dr. Sam", role: "advisor" },
};

const INITIAL_COURSES = [
  { code: "DB200",  title: "Advanced Database",              credits: 3, days: ["Sun","Tue"], start: "10:00", end: "11:15", room: "B-214", seatsLeft: 6,  prereqs: ["CS101"] },
  { code: "OOP200", title: "Object-Oriented Programming",    credits: 3, days: ["Mon","Wed"], start: "12:30", end: "13:45", room: "C-105", seatsLeft: 0,  prereqs: ["CS101"] },
  { code: "IA200",  title: "Intro to Information Assurance", credits: 3, days: ["Sun","Tue"], start: "13:00", end: "14:15", room: "B-118", seatsLeft: 12, prereqs: ["CS101"] },
  { code: "MGT300", title: "Strategic Management",           credits: 3, days: ["Mon","Wed"], start: "09:00", end: "10:15", room: "A-021", seatsLeft: 18, prereqs: ["ENG101"] },
  { code: "ECON201",title: "Microeconomics",                 credits: 3, days: ["Sun","Tue"], start: "08:00", end: "09:15", room: "A-115", seatsLeft: 9,  prereqs: [] },
  { code: "ENT300", title: "Entrepreneurship",               credits: 3, days: ["Mon","Wed"], start: "14:30", end: "15:45", room: "D-201", seatsLeft: 21, prereqs: ["ENG101"] },
  { code: "LAB201", title: "Data Analytics Lab",             credits: 1, days: ["Thu"],       start: "10:00", end: "12:00", room: "Lab-3",  seatsLeft: 2,  prereqs: ["STAT101"] },
];

const DAYS = ["Sun","Mon","Tue","Wed","Thu"];

/* ======= HELPERS ======= */
const toMin = (t) => { const [h,m]=t.split(":").map(Number); return h*60+m; };
const conflicts = (a,b) =>
  a.days.some(d=>b.days.includes(d)) &&
  Math.max(toMin(a.start),toMin(b.start)) < Math.min(toMin(a.end),toMin(b.end));

function useRecommendations(student, selected, courses){
  return useMemo(()=>{
    const done = new Set([...(student.completed||[]), ...(student.inProgress||[])]);
    return courses
      .filter(c=>c.prereqs.every(p=>done.has(p)) && c.seatsLeft>0)
      .filter(c=>!selected.some(s=>s.code===c.code))
      .filter(c=>!selected.some(s=>conflicts(s,c)));
  },[student,selected,courses]);
}

const Pill = ({children}) => (
  <span className="px-2 py-1 text-xs rounded-full bg-slate-100 text-slate-700 border">{children}</span>
);

/* ======= UI ======= */
function Header({tab,setTab, user, onLogout}){
  const tabs=["student","advisor","about"];
  return (
    <div className="flex justify-between p-4 bg-white border-b">
      <div className="font-bold">ICRS • Intelligent Course Registration</div>
      <div className="flex items-center gap-3">
        {user && <span className="text-sm text-slate-600">Signed in as <b>{user.name}</b> ({user.role})</span>}
        <div className="flex gap-2">
          {tabs.map(t=>(
            <button key={t} onClick={()=>setTab(t)}
              className={`px-3 py-1 rounded ${tab===t?"bg-black text-white":"bg-gray-100"}`}>
              {t}
            </button>
          ))}
        </div>
        {user && <button onClick={onLogout} className="px-3 py-1 rounded border">Logout</button>}
      </div>
    </div>
  );
}

function Login({onLogin}){
  const [role,setRole]=useState("student");
  return (
    <div className="p-6 max-w-md mx-auto bg-white border rounded mt-10">
      <h1 className="font-bold text-xl mb-4">Welcome to ICRS</h1>
      <div className="mb-2">Login as:</div>
      <div className="flex gap-2 mb-4">
        {["student","advisor"].map(r=>(
          <button key={r} onClick={()=>setRole(r)}
            className={`px-3 py-1 border rounded ${role===r?"bg-black text-white":""}`}>
            {r}
          </button>
        ))}
      </div>
      <button onClick={()=>onLogin(USERS[role])} className="w-full bg-black text-white py-2 rounded">
        Continue
      </button>
      <p className="text-xs text-slate-500 mt-3 text-center">Prototype • Mock data for portfolio/stakeholder demos.</p>
    </div>
  );
}

function CourseCard({course, onAdd, onDrop, selected}){
  const isSelected = selected.some(c=>c.code===course.code);
  const disabled = !isSelected && course.seatsLeft<=0;
  const action = isSelected ? onDrop : onAdd;
  return (
    <div className="p-3 border rounded flex justify-between bg-white">
      <div>
        <div className="text-sm text-slate-500">{course.code}</div>
        <div className="font-semibold">{course.title}</div>
        <div className="text-sm">{course.days.join("/") } {course.start}-{course.end} • {course.room}</div>
        <div className="text-xs">{course.seatsLeft>0?`${course.seatsLeft} seats left`:"Full • Waitlist"}</div>
      </div>
      <button
        onClick={()=>action(course)}
        disabled={disabled}
        title={disabled ? "Class is full" : ""}
        className={`px-3 py-1 rounded ${isSelected?"bg-rose-500":"bg-emerald-600"} text-white disabled:opacity-40`}
      >
        {isSelected?"Drop":"Add"}
      </button>
    </div>
  );
}

/* Credit Progress Ring */
function CreditProgress({credits, target=15}){
  const radius = 30;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.min(credits/target, 1);
  const offset = circumference - progress * circumference;
  return (
    <svg width="80" height="80">
      <circle stroke="#e5e7eb" strokeWidth="6" fill="transparent" r={radius} cx="40" cy="40"/>
      <circle
        stroke={credits < 12 ? "#f59e0b" : credits <= 18 ? "#10b981" : "#ef4444"}
        strokeWidth="6" fill="transparent" r={radius} cx="40" cy="40"
        strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round"
      />
      <text x="50%" y="50%" textAnchor="middle" dy=".3em" fontSize="14" className="fill-slate-700">
        {credits}
      </text>
    </svg>
  );
}

function Timetable({selected}){
  const { byDay, credits, statusTxt, statusCls } = useMemo(()=>{
    const m = Object.fromEntries(DAYS.map(d=>[d,[]]));
    selected.forEach(c=>c.days.forEach(d=>m[d].push(c)));
    Object.values(m).forEach(arr=>arr.sort((a,b)=>toMin(a.start)-toMin(b.start)));

    const credits = selected.reduce((s,c)=>s+c.credits,0);
    const status =
      credits < 12 ? { txt: "Below full-time", cls: "text-amber-600" } :
      credits <= 18 ? { txt: "Load OK",        cls: "text-green-600" } :
                      { txt: "Overload",       cls: "text-rose-600" };

    return { byDay: m, credits, statusTxt: status.txt, statusCls: status.cls };
  },[selected]);

  return (
    <div className="border rounded p-3 bg-white">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-semibold">Weekly Timetable</h3>
        <div className="flex items-center gap-2">
          <CreditProgress credits={credits} />
          <span className={`text-xs ${statusCls}`}>{statusTxt}</span>
        </div>
      </div>
      {DAYS.map(d=>(
        <div key={d} className="mb-2">
          <div className="font-semibold">{d}</div>
          {byDay[d].length===0 && <div className="text-sm text-slate-500 ml-4">—</div>}
          {byDay[d].map(c=>(
            <div key={c.code} className="ml-4 text-sm">
              {c.code} {c.start}-{c.end} • {c.room}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

/* ======= STUDENT DASHBOARD (with persistence + priority auto-fill) ======= */
function StudentDashboard({user, courses}){
  // restore selection from localStorage by codes -> map to course objects
  const selKey = `icrs_selected_${user.id}`;
  const [selected, setSelected] = useState(()=>{
    try {
      const raw = localStorage.getItem(selKey);
      if (!raw) return [];
      const codes = JSON.parse(raw);
      const map = Object.fromEntries(courses.map(c=>[c.code,c]));
      return codes.map(code => map[code]).filter(Boolean);
    } catch { return []; }
  });

  // if courses change (advisor edits list/ordering), rehydrate selected objects from codes
  useEffect(()=>{
    try {
      const raw = localStorage.getItem(selKey);
      if (!raw) return;
      const codes = JSON.parse(raw);
      const map = Object.fromEntries(courses.map(c=>[c.code,c]));
      setSelected(prev=>{
        const fromCodes = codes.map(code => map[code]).filter(Boolean);
        // keep order from storage
        return fromCodes;
      });
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courses]);

  // persist selection as codes
  useEffect(()=>{
    const codes = selected.map(s=>s.code);
    localStorage.setItem(selKey, JSON.stringify(codes));
  }, [selected, selKey]);

  const recs = useRecommendations(user, selected, courses);

  const add = (c)=> setSelected(s=>s.some(x=>x.code===c.code)?s:[...s,c]);
  const drop = (c)=> setSelected(s=>s.filter(x=>x.code!==c.code));

  /* WOW: Auto-generate schedule (aim 15–18 credits) with degreePlanPriority first */
  const generateSchedule = () => {
    // sort candidate courses by degreePlanPriority index (smaller = higher priority)
    const priorityIndex = new Map(user.degreePlanPriority.map((code, i) => [code, i]));
    const candidates = recs.slice().sort((a,b)=>{
      const ia = priorityIndex.has(a.code) ? priorityIndex.get(a.code) : Infinity;
      const ib = priorityIndex.has(b.code) ? priorityIndex.get(b.code) : Infinity;
      if (ia !== ib) return ia - ib; // degree plan first
      // tie-breakers: more seats first, then earlier start
      if (b.seatsLeft !== a.seatsLeft) return b.seatsLeft - a.seatsLeft;
      return toMin(a.start) - toMin(b.start);
    });

    let plan = [...selected];
    const credits = () => plan.reduce((sum,c)=>sum+c.credits,0);

    for (const course of candidates) {
      if (credits() >= 18) break;
      if (!plan.some(s => s.code === course.code) &&
          !plan.some(s => conflicts(s, course))) {
        plan.push(course);
      }
    }
    // If still below 15, try allowing a single mild overlap (optional). We’ll keep it strict for now.
    setSelected(plan);
  };

  return (
    <div className="grid md:grid-cols-3 gap-4 p-4">
      <div>
        <div className="flex items-center justify-between mb-2">
          <h2 className="font-bold">Smart Recommendations</h2>
          <button onClick={generateSchedule} className="text-xs bg-blue-600 text-white px-2 py-1 rounded">
            Auto-Fill 15–18 Cr
          </button>
        </div>
        <div className="space-y-2">
          {recs.length===0 && <div className="text-sm text-slate-500">No eligible, conflict-free suggestions.</div>}
          {recs.map(c=> <CourseCard key={c.code} course={c} onAdd={add} onDrop={drop} selected={selected}/>)}
        </div>
      </div>
      <div>
        <h2 className="font-bold mb-2">All Courses</h2>
        <div className="space-y-2">
          {courses.map(c=> <CourseCard key={c.code} course={c} onAdd={add} onDrop={drop} selected={selected}/>)}
        </div>
      </div>
      <div>
        <Timetable selected={selected}/>
        <div className="mt-3 border rounded p-3 bg-white">
          <div className="font-semibold mb-2">Conflict Check</div>
          <ul className="text-sm list-disc pl-5">
            {selected.length<=1 && <li className="text-green-600">No conflicts detected.</li>}
            {selected.length>1 &&
              selected.flatMap((a,i)=>selected.slice(i+1).map(b=>({a,b,c:conflicts(a,b)})))
                .map(({a,b,c})=>(
                  <li key={`${a.code}-${b.code}`} className={c?"text-rose-600":"text-green-600"}>
                    {a.code} ↔ {b.code}: {c?"Conflict":"OK"}
                  </li>
                ))
            }
          </ul>
        </div>
      </div>
    </div>
  );
}

/* ======= ADVISOR DASHBOARD (live seat editing + persistence) ======= */
function AdvisorDashboard({courses, setCourses}){
  const updateSeats = (code, delta) => {
    setCourses(prev =>
      prev.map(c => c.code === code ? {...c, seatsLeft: Math.max(0, c.seatsLeft + delta)} : c)
    );
  };
  const setSeats = (code, value) => {
    const n = Math.max(0, Number.isNaN(value) ? 0 : value);
    setCourses(prev =>
      prev.map(c => c.code === code ? {...c, seatsLeft: n} : c)
    );
  };

  return (
    <div className="p-4">
      <div className="max-w-4xl mx-auto bg-white border rounded p-4">
        <h2 className="font-bold text-xl mb-4">Advisor • Seat Management</h2>
        <p className="text-sm text-slate-600 mb-4">
          Adjust seat counts. Changes are instant and reflected in the Student view’s recommendations.
        </p>

        <div className="grid md:grid-cols-2 gap-3">
          {courses.map(course=>(
            <div key={course.code} className="border rounded p-3">
              <div className="flex justify-between items-start">
                <div>
                  <div className="text-sm text-slate-500">{course.code}</div>
                  <div className="font-semibold">{course.title}</div>
                  <div className="text-sm">{course.days.join("/") } {course.start}-{course.end} • {course.room}</div>
                  <div className={`text-xs mt-1 ${course.seatsLeft>0?"text-green-600":"text-rose-600"}`}>
                    {course.seatsLeft>0 ? `${course.seatsLeft} seats available` : "Full • Students will see waitlist"}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={()=>updateSeats(course.code,-1)} className="px-2 py-1 rounded bg-gray-100 border">-</button>
                  <input
                    type="number"
                    value={course.seatsLeft}
                    onChange={(e)=>setSeats(course.code, parseInt(e.target.value,10))}
                    className="w-16 px-2 py-1 border rounded text-center"
                    min={0}
                  />
                  <button onClick={()=>updateSeats(course.code, +1)} className="px-2 py-1 rounded bg-gray-100 border">+</button>
                </div>
              </div>
              <div className="mt-2 flex gap-2">
                <Pill>{course.credits} cr</Pill>
                <Pill>{course.prereqs.length ? `Prereqs: ${course.prereqs.join(", ")}` : "No prereqs"}</Pill>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 text-xs text-slate-500">
          Tip: Set seats to <b>0</b> to hide the class from Student recommendations (acts like a waitlist).
        </div>
      </div>
    </div>
  );
}

/* ======= MAIN APP ======= */
export default function App(){
  const [user,setUser]=useState(null);
  const [tab,setTab]=useState("student");

  // restore courses from localStorage (advisor edits)
  const [courses, setCourses] = useState(()=>{
    try {
      const raw = localStorage.getItem("icrs_courses");
      if (!raw) return INITIAL_COURSES;
      const saved = JSON.parse(raw);
      // basic validation: require code & seatsLeft
      const savedMap = new Map(saved.map(c => [c.code, c]));
      return INITIAL_COURSES.map(def => savedMap.get(def.code) ? {...def, seatsLeft: Math.max(0, Number(savedMap.get(def.code).seatsLeft)||0)} : def);
    } catch { return INITIAL_COURSES; }
  });

  // persist courses on change
  useEffect(()=>{
    localStorage.setItem("icrs_courses", JSON.stringify(courses));
  }, [courses]);

  const handleLogout = () => {
    setUser(null);
    setTab("student");
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Header tab={tab} setTab={setTab} user={user} onLogout={handleLogout}/>
      {!user ? (
        <Login onLogin={setUser}/>
      ) : (
        <>
          {tab==="student" && user.role==="student" && <StudentDashboard user={user} courses={courses}/>}
          {tab==="advisor" && <AdvisorDashboard courses={courses} setCourses={setCourses}/>}
          {tab==="about" && (
            <div className="p-4">
              <div className="max-w-2xl bg-white border rounded p-4">
                <h2 className="font-bold mb-2">About this prototype</h2>
                <p className="text-slate-600 text-sm">
                  ICRS demonstrates conflict‑free scheduling, prerequisite checks, **priority‑aware** auto‑fill, live seat management, and persistence with localStorage.
                </p>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}