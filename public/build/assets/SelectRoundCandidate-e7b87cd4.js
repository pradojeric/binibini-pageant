import{q as p,j as e,s as g,f}from"./app-bb087a40.js";import{A as v}from"./AuthenticatedLayout-34a881ed.js";import"./TextInput-fc1efaee.js";import{I as b}from"./InputLabel-83e42476.js";import"./index-09f8345e.js";/* empty css             */import{P as n}from"./PrimaryButton-4e7bcbe5.js";import{C as N}from"./Checkbox-14b0eebb.js";import{S as k}from"./SelectInput-80a2979b.js";import{I as c}from"./InputError-efa288e2.js";import"./transition-f1420beb.js";function E({auth:o,pageant:r,candidates:m,selected:x=[]}){const{data:a,setData:d,post:u,errors:i,reset:h}=p({round:"",selectedCandidates:x}),l=s=>{s.preventDefault(),u(route("select.store",r.id),{onSuccess:()=>{h()}})},j=s=>{let t=s.target.value;return s.target.checked?d("selectedCandidates",[...a.selectedCandidates,t]):d("selectedCandidates",[...a.selectedCandidates].filter(C=>t!=t))};return e.jsxs(v,{user:o.user,header:e.jsx("h2",{className:"font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight",children:r.pageant}),children:[e.jsx(g,{title:"Pageant"}),e.jsx("div",{className:"py-12 bg-fixed bg-cover",style:{backgroundImage:`url(/storage/${r.background})`},children:e.jsx("div",{className:"max-w-7xl mx-auto sm:px-6 lg:px-8",children:e.jsx("div",{className:"bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg",children:e.jsxs("div",{className:"p-6",children:[e.jsx("div",{className:"mb-4 flex justify-end",children:e.jsx(f,{href:route("pageant.view-scores",r.id),children:e.jsx(n,{children:"Back"})})}),e.jsx(c,{message:i.round}),e.jsx(c,{message:i.selectedCandidates}),e.jsxs("form",{onSubmit:l,children:[e.jsxs("div",{className:"mt-4 gap-2 flex items-center",children:[e.jsx(b,{value:"Round"}),e.jsxs(k,{name:"round",onChange:s=>{d("round",s.target.value)},children:[e.jsx("option",{value:"",hidden:!0,children:"Select"}),e.jsx("option",{value:"0",children:"Round 0"}),r.pageant_rounds.map((s,t)=>e.jsx("option",{value:s.id,children:`Round ${s.round} (${s.number_of_candidates})`},"R"+t))]})]}),e.jsx("div",{className:"mt-4",children:m.map(s=>e.jsx("div",{children:e.jsxs("label",{className:"flex items-center gap-4",children:[e.jsx(N,{name:"selectedJudges[]",value:s.id,defaultChecked:a.selectedCandidates.includes(s.id),onChange:j}),e.jsxs("div",{className:"flex space-x-4 items-center px-3 py-2",children:[e.jsx("div",{children:s.picture?e.jsx("img",{className:"rounded-full h-16 w-16 object-cover border border-black bg-white",src:"/storage/"+s.picture,alt:s.full_name}):""}),e.jsx("div",{className:"dark:text-white",children:"#"+s.candidate_number}),e.jsxs("div",{children:[e.jsx("div",{className:"uppercase font-bold dark:text-white",children:s.full_name}),e.jsx("div",{className:"text-sm text-gray-400",children:s.nickname})]})]})]})},s.id))}),e.jsx("div",{className:"mt-4",children:e.jsx(n,{onClick:l,children:"Add"})})]})]})})})})]})}export{E as default};