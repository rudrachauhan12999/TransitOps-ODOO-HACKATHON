File: frontend/src/App.tsx
import { useState } from "react";

function App() {
  const [project] = useState("TransitOps AI");

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100">
      <div className="bg-white shadow-lg rounded-xl p-8 text-center">
        <h1 className="text-3xl font-bold text-blue-600">{project}</h1>
        <p className="mt-2 text-gray-600">
          Smart Transport Operations Platform
        </p>

        <button className="mt-6 bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700">
          Get Started
        </button>
      </div>
    </div>
  );
}

export default App;


Index.html
<!DOCTYPE html>
<html>
<head>
    <title>AI Transport Management System</title>

    <style>
        body {
            font-family: Arial;
            background: #f2f2f2;
            text-align: center;
        }

        .container {
            margin: 50px auto;
            width: 400px;
            background:white;
            padding:20px;
            border-radius:10px;
        }

        input,button {
            width:90%;
            padding:10px;
            margin:10px;
        }

        button {
            background:#007bff;
            color:white;
            border:none;
            cursor:pointer;
        }

        #result {
            margin-top:20px;
            font-weight:bold;
        }
    </style>

</head>

<body>

<div class="container">

<h1>Transport Management System</h1>

<input id="location" placeholder="Enter Location">

<input id="destination" placeholder="Enter Destination">

<button onclick="predictRoute()">
    Find Best Route
</button>


<div id="result"></div>

</div>


<script>

async function predictRoute(){

let location =
document.getElementById("location").value;


let destination =
document.getElementById("destination").value;



let response = await fetch(
"http://127.0.0.1:5000/predict",
{
method:"POST",
headers:{
"Content-Type":"application/json"
},

body:JSON.stringify({

source:location,
destination:destination

})

});


let data = await response.json();


document.getElementById("result").innerHTML =
"AI Suggestion: "+data.route;

}

</script>


</body>
</html>

