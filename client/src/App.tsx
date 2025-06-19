import { Route, Switch } from "wouter";
import { Suspense, lazy } from "react";
import { Loader2 } from "lucide-react";

// Page components with lazy loading
const Home = lazy(() => import("@/pages/home"));
const Products = lazy(() => import("@/pages/products"));
const CakeBuilder = lazy(() => import("@/pages/cake-builder"));
const DashboardCustomer = lazy(() => import("@/pages/dashboard-customer"));
const DashboardJuniorBaker = lazy(() => import("@/pages/dashboard-junior-baker"));
const DashboardMainBaker = lazy(() => import("@/pages/dashboard-main-baker"));
const DashboardAdmin = lazy(() => import("@/pages/dashboard-admin"));
const OrderTracking = lazy(() => import("@/pages/order-tracking"));
const Login = lazy(() => import("@/pages/login"));
const Register = lazy(() => import("@/pages/register"));
const NotFound = lazy(() => import("@/pages/not-found"));
const About = lazy(() => import("@/pages/about"));
const Contact = lazy(() => import("@/pages/contact"));
const Profile = lazy(() => import("@/pages/profile"));
const Orders = lazy(() => import("@/pages/orders"));
const Chat = lazy(() => import("@/pages/chat"));
const OrderDetail = lazy(() => import("@/pages/order-detail"));
const Bakers = lazy(() => import("@/pages/bakers"));
const ApplyJuniorBaker = lazy(() => import("@/pages/apply-junior-baker"));
const Checkout = lazy(() => import("@/pages/checkout"));

// Customer Dashboard Pages
const CustomerOrders = lazy(() => import("@/pages/dashboard/customer/orders"));
const CustomerOrderDetail = lazy(() => import("@/pages/order-detail"));
const CustomerSaved = lazy(() => import("@/pages/dashboard/customer/saved"));
const CustomerChat = lazy(() => import("@/pages/dashboard/customer/chat"));
const CustomerSettings = lazy(() => import("@/pages/dashboard/customer/settings"));

// Junior Baker Dashboard Pages
const JuniorBakerApplyPromotion = lazy(() => import("@/pages/dashboard/junior-baker/apply-promotion"));
const JuniorBakerTasks = lazy(() => import("@/pages/dashboard/junior-baker/tasks"));
const JuniorBakerChat = lazy(() => import("@/pages/dashboard/junior-baker/chat"));
const JuniorBakerCompleted = lazy(() => import("@/pages/dashboard/junior-baker/completed"));

// Main Baker Dashboard Pages
const MainBakerDashboard = lazy(() => import("@/pages/dashboard/main-baker"));
const MainBakerAddProduct = lazy(() => import("@/pages/dashboard/main-baker/add-product"));
const MainBakerOrders = lazy(() => import("@/pages/dashboard/main-baker/orders"));
const MainBakerBakers = lazy(() => import("@/pages/dashboard/main-baker/bakers"));
const MainBakerQuality = lazy(() => import("@/pages/dashboard/main-baker/quality"));
const MainBakerChat = lazy(() => import("@/pages/dashboard/main-baker/chat"));

// Admin Dashboard Pages
const AdminUsers = lazy(() => import("@/pages/admin-users"));
const AdminApplications = lazy(() => import("@/pages/admin-applications"));

// Loading component
const PageLoader = () => (
  <div className="min-h-screen w-full flex items-center justify-center bg-background">
    <Loader2 className="h-12 w-12 text-primary animate-spin" />
  </div>
);

function App() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Switch>
        {/* Main pages */}
        <Route path="/" component={Home} />
        <Route path="/products" component={Products} />
        <Route path="/cake-builder" component={CakeBuilder} />
        <Route path="/login" component={Login} />
        <Route path="/register" component={Register} />
        <Route path="/about" component={About} />
        <Route path="/contact" component={Contact} />
        <Route path="/profile" component={Profile} />
        <Route path="/orders" component={Orders} />
        <Route path="/orders/:orderId" component={OrderDetail} />
        <Route path="/chat" component={Chat} />
        <Route path="/chat/:orderId" component={Chat} />
        <Route path="/bakers" component={Bakers} />
        <Route path="/apply-junior-baker/:bakerId" component={ApplyJuniorBaker} />
        <Route path="/checkout" component={Checkout} />
        <Route path="/track-order" component={OrderTracking} />
        
        {/* Dashboard routes */}
        <Route path="/dashboard/customer" component={DashboardCustomer} />
        <Route path="/dashboard/junior-baker" component={DashboardJuniorBaker} />
        <Route path="/dashboard/main-baker" component={DashboardMainBaker} />
        <Route path="/dashboard/admin" component={DashboardAdmin} />
        <Route path="/dashboard/admin/users" component={AdminUsers} />
        <Route path="/dashboard/admin/applications" component={AdminApplications} />
        
        {/* Customer dashboard pages */}
        <Route path="/dashboard/customer/orders" component={CustomerOrders} />
        <Route path="/dashboard/customer/orders/:orderId" component={CustomerOrderDetail} />
        <Route path="/dashboard/customer/saved" component={CustomerSaved} />
        <Route path="/dashboard/customer/chat" component={CustomerChat} />
        <Route path="/dashboard/customer/chat/:orderId" component={CustomerChat} />
        <Route path="/dashboard/customer/settings" component={CustomerSettings} />
          {/* Junior Baker dashboard pages */}
        <Route path="/dashboard/junior-baker/apply-promotion" component={JuniorBakerApplyPromotion} />
        <Route path="/dashboard/junior-baker/tasks" component={JuniorBakerTasks} />
        <Route path="/dashboard/junior-baker/chat" component={JuniorBakerChat} />
        <Route path="/dashboard/junior-baker/completed" component={JuniorBakerCompleted} />
          {/* Main Baker dashboard pages */}
        <Route path="/dashboard/main-baker/add-product" component={MainBakerAddProduct} />
        <Route path="/dashboard/main-baker/orders" component={MainBakerOrders} />
        <Route path="/dashboard/main-baker/bakers" component={MainBakerBakers} />
        <Route path="/dashboard/main-baker/quality" component={MainBakerQuality} />
        <Route path="/dashboard/main-baker/chat" component={MainBakerChat} />
          {/* Admin dashboard pages */}
        <Route path="/admin/users" component={AdminUsers} />
        <Route path="/admin/applications" component={AdminApplications} />
        
        {/* 404 page */}
        <Route component={NotFound} />
      </Switch>
    </Suspense>
  );
}

export default App;
