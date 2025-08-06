import NewpointNav from "./components/NewpointNav";



export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      
      <NewpointNav/>
      <main>{children}</main>

      

    </div>
  );
}