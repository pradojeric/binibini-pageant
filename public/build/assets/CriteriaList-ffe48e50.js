import{q as p,j as e}from"./app-bb087a40.js";import{T as x}from"./TableComponent-de06d55f.js";import{P as n}from"./PrimaryButton-4e7bcbe5.js";function j({criterias:c,handleEditMode:a=()=>{}}){const{delete:d}=p({}),s=route().current("pageants.criterias.index"),r=["Round","Group","Name","Percentage","Score by Admin"];s&&r.push("Action");function l(t){d(route("criterias.destroy",t),{onSuccess:()=>alert("Successfully deleted"),onError:()=>alert("Error deleted")})}return e.jsxs(e.Fragment,{children:[e.jsx("h2",{className:"uppercase font-bold",children:"List of Criterias"}),e.jsx(x,{header:r,children:c.map((t,o)=>e.jsxs("tr",{children:[e.jsx("td",{className:"text-center px-3 py-2",children:t.round}),e.jsx("td",{className:"text-center px-3 py-2",children:t.group}),e.jsx("td",{className:"text-center px-3 py-2",children:t.name}),e.jsx("td",{className:"text-center px-3 py-2",children:t.percentage}),e.jsx("td",{className:"text-center px-3 py-2",children:t.hidden_scoring?"True":"False"}),s&&e.jsxs("td",{className:"text-center px-3 py-2 flex space-x-1",children:[e.jsx(n,{className:"!p-2",onClick:()=>a(t),children:"Edit"}),e.jsx(n,{className:"!p-2",onClick:i=>{i.preventDefault(),l(t.id)},children:"Delete"})]})]},o))})]})}export{j as default};