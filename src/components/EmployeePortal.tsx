import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { useNavigate } from "react-router-dom";
import { User } from "@/types/user";

interface EmployeePortalProps {
  user: User;
}

const EmployeePortal: React.FC<EmployeePortalProps> = ({ user }) => {
  const navigate = useNavigate();

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Employee Portal</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card>
          <h2 className="text-xl font-semibold mb-2">Dashboard</h2>
          <p className="text-gray-600">View your personal dashboard</p>
          <Button 
            onClick={() => navigate('/dashboard')}
            className="mt-4"
          >
            Go to Dashboard
          </Button>
        </Card>

        <Card>
          <h2 className="text-xl font-semibold mb-2">Documents</h2>
          <p className="text-gray-600">Manage your documents</p>
          <Button 
            onClick={() => navigate('/documents')}
            className="mt-4"
          >
            View Documents
          </Button>
        </Card>

        <Card>
          <h2 className="text-xl font-semibold mb-2">Notifications</h2>
          <p className="text-gray-600">Check your notifications</p>
          <Button 
            onClick={() => navigate('/notifications')}
            className="mt-4"
          >
            View Notifications
          </Button>
        </Card>
      </div>
    </div>
  );
};

export default EmployeePortal;
