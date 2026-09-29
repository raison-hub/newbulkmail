import { useState } from "react";
import axios from "axios";
import * as XLSX from "xlsx";

function App() {
  const [msg, setmsg] = useState("");
  const [status, setstatus] = useState(false);
  const [emailList, setemailList] = useState([]);

  function handlemsg(event) {
    setmsg(event.target.value);
  }

  function handlefile(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();

  reader.onload = function (e) {
    const data = new Uint8Array(e.target.result);
    
    const workbook = XLSX.read(data, { type: "array" });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const parsedData = XLSX.utils.sheet_to_json(worksheet, { header: "A" });

 
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    const validEmails = parsedData
      .map((item) => (typeof item.A === "string" ? item.A.trim() : ""))
      .filter((email) => emailRegex.test(email));

    console.log("Filtered Valid Emails:", validEmails);
    setemailList(validEmails);
  };


  reader.readAsArrayBuffer(file);
}
  function send() {
    if (!msg.trim()) {
      alert("Please enter a message.");
      return;
    }
    if (emailList.length === 0) {
      alert("Please upload a file with email addresses.");
      return;
    }

    setstatus(true);
    axios
      .post("https://newbulkmail.vercel.app/sendemail", {
        msg: msg,
        emailList: emailList,
      })
      .then(function (data) {
        if (data.data === true) {
          alert("Email sent successfully");
        } else {
          alert("Failed to send email");
        }
      })
      .catch(function (error) {
        console.error(error);
        alert("Server error occurred while sending email.");
      })
      .finally(function () {
        setstatus(false);
      });
  }

  return (
    <div className="min-h-screen font-sans">
      <div className="bg-slate-900 text-white text-center py-4 shadow-md">
        <h1 className="text-3xl font-bold tracking-tight">Bulk Mail</h1>
      </div>

      <div className="bg-blue-800 text-white text-center py-14 px-4">
        <h2 className="text-2xl md:text-3xl font-semibold max-w-2xl mx-auto leading-relaxed">
          We can help your business send multiple emails at once
        </h2>
      </div>

      <div className="bg-blue-600 text-white text-center py-10 px-4 shadow-inner">
        <h3 className="text-xl md:text-2xl font-medium tracking-wide">
          Drag and Drop
        </h3>
      </div>

      <div className="bg-slate-100 flex flex-col items-center text-slate-800 px-6 py-12">
        <textarea
          onChange={handlemsg}
          value={msg}
          className="w-full max-w-2xl h-36 p-4 text-base bg-white border border-slate-300 rounded-lg shadow-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
          placeholder="Enter the email text..."
        ></textarea>

        <input
          type="file"
          onChange={handlefile}
          className="w-full max-w-2xl border-2 border-dashed border-slate-300 bg-white hover:border-blue-500 rounded-lg p-5 mt-6 mb-4 text-sm text-slate-600 cursor-pointer transition text-center file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
        />

        <p className="text-sm font-semibold text-slate-600 mt-2">
          Total Emails in the file:{" "}
          <span className="text-blue-700 font-bold">{emailList.length}</span>
        </p>

        <button
          onClick={send}
          disabled={status}
          className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-base font-semibold px-8 py-2.5 rounded-lg shadow-md hover:shadow-lg transition duration-200 mt-5"
        >
          {status ? "Sending..." : "Send"}
        </button>
      </div>
    </div>
  );
}

export default App;