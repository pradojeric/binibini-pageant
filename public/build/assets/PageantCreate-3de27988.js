import{q as f,j as e,s as v}from"./app-bb087a40.js";import{A as b}from"./AuthenticatedLayout-34a881ed.js";import{I as i}from"./InputLabel-83e42476.js";import{T as m}from"./TextInput-fc1efaee.js";import{I as c}from"./InputError-efa288e2.js";import{S as N}from"./SelectInput-80a2979b.js";import{P as y}from"./PrimaryButton-4e7bcbe5.js";import"./transition-f1420beb.js";function R({auth:x}){const{data:s,setData:n,post:g,processing:h,errors:o,reset:_}=f({pageant:"",type:"",background:"",rounds:1,pageant_rounds:{mr:[{round:1,number_of_candidates:1}],ms:[{round:1,number_of_candidates:1}]}}),p=[{id:"ms",value:"Ms."},{id:"mr",value:"Mr."},{id:"mr&ms",value:"Mr. & Ms."}],u=()=>{if(!s.type)return[];const a=/m[rs]/g;return[...s.type.match(a)]};function j(a){a.preventDefault(),g(route("pageants.store"))}return e.jsxs(b,{user:x.user,header:e.jsx("h2",{className:"font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight",children:"Create Pageants"}),children:[e.jsx(v,{title:"Pageant"}),e.jsx("div",{className:"py-12",children:e.jsx("div",{className:"max-w-7xl mx-auto sm:px-6 lg:px-8",children:e.jsx("div",{className:"bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg",children:e.jsx("div",{className:"p-6",children:e.jsxs("form",{onSubmit:j,children:[e.jsxs("div",{children:[e.jsx(i,{htmlFor:"pageant",value:"Pageant Name"}),e.jsx(m,{id:"pageant",type:"text",name:"pageant",value:s.pageant,className:"mt-1 block w-full",onChange:a=>n("pageant",a.target.value)}),e.jsx(c,{message:o.pageant,className:"mt-2"})]}),e.jsxs("div",{className:"mt-4",children:[e.jsx(i,{htmlFor:"type",value:"Pageant Type"}),e.jsxs(N,{id:"type",name:"type",className:"mt-1 block w-full",value:s.type,onChange:a=>n("type",a.target.value),children:[e.jsx("option",{hidden:!0,children:"Select..."}),p.map(a=>e.jsx("option",{value:a.id,children:a.value},a.id))]}),e.jsx(c,{message:o.type,className:"mt-2"})]}),e.jsxs("div",{className:"mt-4",children:[e.jsx(i,{htmlFor:"background",value:"Custom Background"}),e.jsx(m,{id:"background",type:"file",name:"background",accept:"image/*",onChange:a=>n("background",a.target.files[0]),className:"mt-1 block w-full"}),e.jsx(c,{message:o.background,className:"mt-2"})]}),e.jsxs("div",{className:"mt-4",children:[e.jsx(i,{htmlFor:"rounds",value:"Rounds"}),e.jsx(m,{id:"rounds",type:"number",name:"rounds",value:s.rounds,min:1,className:"mt-1 block w-full",onChange:a=>{const t=Array.from({length:a.target.value},(r,l)=>({round:l+1,number_of_candidates:1})),d={rounds:a.target.value,pageant_rounds:{mr:[...t],ms:[...t]}};n({...s,...d})}}),e.jsx(c,{message:o.rounds,className:"mt-2"})]}),e.jsx("div",{className:"mt-4",children:e.jsxs("div",{className:"flex justify-between gap-4 dark:text-white",children:[u().includes("mr")&&e.jsxs("div",{children:[e.jsx("div",{className:"uppercase tracking-wide",children:"Male Candidate"}),e.jsxs("table",{className:"w-full",children:[e.jsx("thead",{children:e.jsxs("tr",{children:[e.jsx("th",{children:"Round"}),e.jsx("th",{children:"Number of Candidates"})]})}),e.jsx("tbody",{children:s.pageant_rounds.mr.map((a,t)=>e.jsxs("tr",{children:[e.jsx("td",{className:"text-center",children:a.round}),e.jsx("td",{children:e.jsx(m,{type:"number",value:a.number_of_candidates,onChange:d=>{const r=s.pageant_rounds.mr;r[t]={round:a.round,number_of_candidates:d.target.value};const l=r;n("pageant_rounds",{...s.pageant_rounds,mr:l})}})})]},"mr"+a.round))})]})]}),u().includes("ms")&&e.jsxs("div",{children:[e.jsx("div",{className:"uppercase tracking-wide",children:"Female Candidate"}),e.jsxs("table",{className:"w-full",children:[e.jsx("thead",{children:e.jsxs("tr",{children:[e.jsx("th",{className:"px-3 py-2",children:"Round"}),e.jsx("th",{className:"px-3 py-2",children:"Number of Candidates"})]})}),e.jsx("tbody",{children:s.pageant_rounds.ms.map((a,t)=>e.jsxs("tr",{children:[e.jsx("td",{className:"text-center",children:a.round}),e.jsx("td",{children:e.jsx(m,{type:"number",value:a.number_of_candidates,onChange:d=>{const r=s.pageant_rounds.ms;r[t]={round:a.round,number_of_candidates:d.target.value};const l=r;console.log(s.pageant_rounds),n("pageant_rounds",{...s.pageant_rounds,ms:l})}})})]},"ms"+a.round))})]})]})]})}),e.jsx("div",{className:"flex items-center justify-end mt-4",children:e.jsx(y,{className:"ml-4",disabled:h,children:"Create"})})]})})})})})]})}export{R as default};