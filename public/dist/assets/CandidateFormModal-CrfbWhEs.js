import{r as x,j as e}from"./app-DhQUmDYX.js";import{F as p}from"./XMarkIcon-BKf7q7zk.js";const v=({isOpen:i,onClose:n,candidate:l,formSettings:a})=>{if(x.useEffect(()=>{console.log("Form Settings received:",a)},[a]),!i)return null;if(!a)return e.jsx("div",{className:"fixed inset-0 overflow-y-auto z-50","aria-labelledby":"modal-title",role:"dialog","aria-modal":"true",children:e.jsx("div",{className:"flex items-center justify-center min-h-screen",children:e.jsx("div",{className:"bg-white p-6 rounded-lg shadow-xl",children:e.jsx("p",{children:"Loading form settings..."})})})});const[o,b]=useState([]),[f,c]=useState("");if(x.useEffect(()=>{var s;if(console.log("Form Settings received:",a),a&&i){const r=Object.entries(a.data).map(([t,d])=>({id:t,name:t,sections:[{id:t,name:t,fields:Object.entries(d).map(([m,u])=>({label:m,inputType:g(u),size:"half",defaultValue:(l==null?void 0:l[m])||u}))}]}));b(r),c(((s=r[0])==null?void 0:s.id)||"")}},[a,l,i]),!i)return null;const g=s=>typeof s=="boolean"?"checkbox":typeof s=="number"?"number":s instanceof Date?"date":"text",h=()=>{const s=o.find(r=>r.id===f);return s?e.jsx("div",{className:"space-y-8",children:s.sections.map(r=>e.jsxs("div",{className:"section",children:[e.jsx("h3",{className:"text-lg font-medium leading-6 text-gray-900",children:r.name}),e.jsx("div",{className:"mt-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2",children:r.fields.map((t,d)=>e.jsxs("div",{children:[e.jsx("label",{htmlFor:t.label,className:"block text-sm font-medium text-gray-700",children:t.label}),e.jsx("div",{className:"mt-1",children:t.inputType==="checkbox"?e.jsx("input",{type:"checkbox",defaultChecked:t.defaultValue,id:t.label,className:"focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded"}):e.jsx("input",{type:t.inputType,defaultValue:t.defaultValue,id:t.label,className:"shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"})})]},d))})]},r.id))}):null};return a?e.jsx("div",{className:"fixed inset-0 overflow-y-auto z-50","aria-labelledby":"modal-title",role:"dialog","aria-modal":"true",children:e.jsxs("div",{className:"flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0",children:[e.jsx("div",{className:"fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity","aria-hidden":"true",onClick:n}),e.jsx("span",{className:"hidden sm:inline-block sm:align-middle sm:h-screen","aria-hidden":"true",children:"​"}),e.jsxs("div",{className:"inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:w-[60%] sm:max-w-[1000px] w-[80%]",children:[e.jsxs("div",{className:"bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4",children:[e.jsxs("div",{className:"flex justify-between items-start pb-3 border-b border-gray-200",children:[e.jsx("h3",{className:"text-lg font-medium leading-6 text-gray-900",id:"modal-title",children:"Candidate Form"}),e.jsxs("button",{type:"button",className:"bg-white rounded-md text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500",onClick:n,children:[e.jsx("span",{className:"sr-only",children:"Close"}),e.jsx(p,{className:"h-6 w-6","aria-hidden":"true"})]})]}),e.jsxs("div",{className:"mt-5 sm:mt-6 flex h-[60vh]",children:[e.jsx("div",{className:"w-1/4 pr-4 overflow-y-auto border-r border-gray-200",children:e.jsx("nav",{className:"space-y-1","aria-label":"Sidebar",children:o.map(s=>e.jsx("button",{onClick:()=>c(s.id),className:`
                        activeTab === tab.id
                          ? 'bg-gray-100 text-gray-900'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      } group w-full flex items-center px-3 py-2 text-sm font-medium rounded-md`,children:s.name},s.id))})}),e.jsx("div",{className:"w-3/4 pl-4 overflow-y-auto",children:h()})]})]}),e.jsxs("div",{className:"bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse",children:[e.jsx("button",{type:"button",className:"w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm",children:"Save"}),e.jsx("button",{type:"button",className:"mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:w-auto sm:text-sm",onClick:n,children:"Cancel"})]})]})]})}):e.jsx("div",{className:"fixed inset-0 overflow-y-auto z-50","aria-labelledby":"modal-title",role:"dialog","aria-modal":"true",children:e.jsx("div",{className:"flex items-center justify-center min-h-screen",children:e.jsx("div",{className:"bg-white p-6 rounded-lg shadow-xl",children:e.jsx("p",{children:"Loading form settings..."})})})})};export{v as default};
