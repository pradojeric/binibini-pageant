import{r as o,j as e,s as c,f as l}from"./app-bb087a40.js";import{A as m}from"./AuthenticatedLayout-34a881ed.js";import{P as x}from"./PrimaryButton-4e7bcbe5.js";import"./TextInput-fc1efaee.js";import"./Tooltip-d6371f8a.js";import p from"./CandidateCreate-800c9399.js";import h from"./CandidateList-f200cdba.js";import g from"./CandidateEdit-72bbd1b9.js";import"./transition-f1420beb.js";import"./InputError-efa288e2.js";import"./InputLabel-83e42476.js";import"./SelectInput-80a2979b.js";import"./TextArea-aa6a3c1c.js";import"./TableComponent-de06d55f.js";function u(i,t){switch(t.type){case"start_editing":return{...i,editing:!0,candidate:t.candidate};case"stop_editing":return{...i,editing:!1,candidate:null}}throw Error("Unknown action: "+t.type)}function M({auth:i,pageant:t}){const[d,a]=o.useReducer(u,{editing:!1,candidate:null}),s=n=>{a({type:"start_editing",candidate:n})},r=()=>{a({type:"stop_editing"})};return e.jsxs(m,{user:i.user,header:e.jsx("h2",{className:"font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight",children:t.pageant}),children:[e.jsx(c,{title:"Pageant"}),e.jsx("div",{className:"py-12",children:e.jsx("div",{className:"max-w-7xl mx-auto sm:px-6 lg:px-8",children:e.jsx("div",{className:"bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg",children:e.jsxs("div",{className:"p-6 dark:text-white",children:[e.jsx(l,{href:route("pageants.show",t.id),children:e.jsx(x,{children:"Back"})}),e.jsxs("div",{className:"grid grid-cols-3 gap-4 mt-5",children:[e.jsx("div",{children:d.editing?e.jsx(g,{candidate:d.candidate,handleCancelEditMode:r}):e.jsx(p,{pageant:t})}),e.jsx("div",{className:"col-span-2",children:e.jsx(h,{handleEditMode:s,candidates:t.candidates})})]})]})})})})]})}export{M as default};