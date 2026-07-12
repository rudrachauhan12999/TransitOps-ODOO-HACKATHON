import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Header from "./Header";


export default function DashboardLayout(){

    return (

        <div className="flex min-h-screen bg-zinc-950 text-white">

            <Sidebar/>

            <div className="flex-1">

                <Header/>

                <main className="p-6">

                    <Outlet/>

                </main>

            </div>

        </div>

    )
}
