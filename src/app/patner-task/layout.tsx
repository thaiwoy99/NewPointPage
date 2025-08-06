import PatnertaskNav from "./components/patnertaskNav";



export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      
      {/* <PatnertaskNav/>*/}
      <main>{children}</main>

      

    </div>
  );
}