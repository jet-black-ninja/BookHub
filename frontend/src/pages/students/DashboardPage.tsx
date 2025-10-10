import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Link } from "react-router-dom";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  BookOpen,
  Clock,
  IndianRupee,
  AlertCircle,
  CheckCircle,
  Users,
  TrendingUp,
  ArrowRight,
  Calendar,
} from "lucide-react";
import type { Borrowing } from "@/schemas/library";

interface DashboardStats {
  activeBorrowings: number;
  overdueBorrowings: number;
  totalFines: number;
}

export const DashboardPage = () => {
  const { user } = useAuth();
  const [borrowings, setBorrowings] = useState<Borrowing[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    activeBorrowings: 0,
    overdueBorrowings: 0,
    totalFines: 0,
  });
  const [loading, setLoading] = useState(true);

  const BASE_URL = import.meta.env.VITE_BACKEND_URL;

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`${BASE_URL}/student/my-borrowings`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) throw new Error("Failed to fetch borrowings");

        const result = await res.json();
        const data: Borrowing[] = result.data || [];
        
        setBorrowings(data);

        const active = data.filter((b) => b.status === "ACTIVE").length;
        const overdue = data.filter((b) => b.status === "OVERDUE").length;
        const totalFines = data.reduce(
          (sum, b) => sum + Number(b.totalFine || 0),
          0
        );

        setStats({
          activeBorrowings: active + overdue,
          overdueBorrowings: overdue,
          totalFines,
        });
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [BASE_URL]);

  const getStatusBadge = (status: string) => {
    const badges = {
      ACTIVE: { class: "bg-blue-100 text-blue-800", label: "Active" },
      RETURNED: { class: "bg-green-100 text-green-800", label: "Returned" },
      OVERDUE: { class: "bg-red-100 text-red-800", label: "Overdue" },
      LOST: { class: "bg-gray-100 text-gray-800", label: "Lost" },
    };
    return badges[status as keyof typeof badges] || badges.ACTIVE;
  };

  const getDaysRemaining = (dueDate: string) => {
    const today = new Date();
    const due = new Date(dueDate);
    const diff = Math.ceil(
      (due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
    );
    return diff;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-pulse text-gray-500">
          Loading your dashboard...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 text-white shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">
              Welcome back, {user?.fullName?.split(" ")[0]}! 📚
            </h1>
            <p className="text-blue-100">
              {stats.activeBorrowings > 0
                ? `You have ${stats.activeBorrowings} active borrowing${
                    stats.activeBorrowings > 1 ? "s" : ""
                  }`
                : "Ready to discover your next great read?"}
            </p>
          </div>
          <Link to="/books">
            <Button className="bg-white text-blue-600 hover:bg-blue-50">
              Browse Books
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard
          title="Active Borrowings"
          value={stats.activeBorrowings}
          icon={<BookOpen className="h-5 w-5 text-blue-600" />}
          color="blue"
          subtitle="Books currently borrowed"
        />
        <StatCard
          title="Overdue Books"
          value={stats.overdueBorrowings}
          icon={<AlertCircle className="h-5 w-5 text-orange-600" />}
          color="orange"
          subtitle={
            stats.overdueBorrowings > 0 ? "Please return soon" : "All on time!"
          }
        />
        <StatCard
          title="Total Fines"
          value={`₹${stats.totalFines.toFixed(2)}`}
          icon={<IndianRupee className="h-5 w-5 text-red-600" />}
          color="red"
          subtitle={stats.totalFines > 0 ? "Pending payment" : "No fines!"}
        />
      </div>

      {/* Borrowings */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-xl">Current Borrowings</CardTitle>
          <Link to="/my-borrowings">
            <Button variant="outline" size="sm">
              View All
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          {borrowings.length === 0 ? (
            <EmptyBorrowing />
          ) : (
            <div className="space-y-4">
              {borrowings.map((borrowing) => (
                <BorrowingCard
                  key={borrowing.id}
                  borrowing={borrowing}
                  getStatusBadge={getStatusBadge}
                  getDaysRemaining={getDaysRemaining}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <QuickActions />
    </div>
  );
};

const StatCard = ({
  title,
  value,
  icon,
  color,
  subtitle,
}: {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
  subtitle: string;
}) => (
  <Card className={`border-l-4 border-l-${color}-500`}>
    <CardHeader className="flex flex-row items-center justify-between pb-2">
      <CardTitle className="text-sm font-medium text-gray-600">
        {title}
      </CardTitle>
      <div className={`p-2 bg-${color}-100 rounded-lg`}>{icon}</div>
    </CardHeader>
    <CardContent>
      <div className="text-3xl font-bold text-gray-800">{value}</div>
      <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
    </CardContent>
  </Card>
);

const EmptyBorrowing = () => (
  <div className="text-center py-12">
    <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
      <BookOpen className="h-8 w-8 text-gray-400" />
    </div>
    <h3 className="text-lg font-medium text-gray-800 mb-2">
      No active borrowings
    </h3>
    <p className="text-gray-500 mb-4">
      Start exploring our collection and borrow your first book
    </p>
    <Link to="/books">
      <Button className="bg-blue-600 hover:bg-blue-700">
        <BookOpen className="mr-2 h-4 w-4" />
        Browse Books
      </Button>
    </Link>
  </div>
);

const BorrowingCard = ({
  borrowing,
  getStatusBadge,
  getDaysRemaining,
}: {
  borrowing: Borrowing;
  getStatusBadge: (status: string) => { class: string; label: string };
  getDaysRemaining: (dueDate: string) => number;
}) => {
  const daysLeft = getDaysRemaining(borrowing.dueDate);
  const statusBadge = getStatusBadge(borrowing.status);

  return (
    <div className="border rounded-xl p-5 hover:shadow-md transition-all bg-gradient-to-r from-white to-gray-50">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-2 flex-wrap">
          <span
            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${statusBadge.class}`}
          >
            {statusBadge.label}
          </span>
          {borrowing.borrowType === "GROUP" && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-800">
              <Users className="h-3 w-3 mr-1" />
              Group Borrowing
            </span>
          )}
          {borrowing.totalFine > 0 && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800">
              <IndianRupee className="h-3 w-3 mr-1" />
              ₹{Number(borrowing.totalFine).toFixed(2)} Fine
            </span>
          )}
        </div>
        <div className="text-right">
          <div className="flex items-center gap-1 text-gray-500 text-xs mb-1">
            <Calendar className="h-3 w-3" />
            Due Date
          </div>
          <p className="text-sm font-semibold text-gray-800">
            {new Date(borrowing.dueDate).toLocaleDateString("en-IN", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
          </p>
          {borrowing.status === "ACTIVE" && (
            <p
              className={`text-xs mt-1 ${
                daysLeft < 7 ? "text-orange-600" : "text-gray-500"
              }`}
            >
              {daysLeft > 0
                ? `${daysLeft} days left`
                : `${Math.abs(daysLeft)} days overdue`}
            </p>
          )}
        </div>
      </div>

      {/* Borrowed Books */}
      <div className="space-y-3 mb-4">
        {borrowing.book ? (
          <div className="flex items-center gap-4 p-3 bg-white rounded-lg border">
            <div className="flex-shrink-0">
              {borrowing.book.coverImageUrl ? (
                <img
                  src={borrowing.book.coverImageUrl}
                  alt={borrowing.book.title}
                  className="h-16 w-12 object-cover rounded shadow-sm"
                />
              ) : (
                <div className="h-16 w-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded flex items-center justify-center">
                  <BookOpen className="h-6 w-6 text-white" />
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-gray-800 truncate">
                {borrowing.book.title}
              </p>
              <p className="text-sm text-gray-500">{borrowing.book.author}</p>
            </div>
            {borrowing.status === "RETURNED" && (
              <div className="flex-shrink-0">
                <div className="inline-flex items-center px-2 py-1 bg-green-100 rounded text-xs text-green-700">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Returned
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-4 text-gray-500">
            <BookOpen className="h-8 w-8 mx-auto mb-2 text-gray-400" />
            <p>No book information available</p>
          </div>
        )}
      </div>

      {/* Group Members */}
      {borrowing.borrowType === "GROUP" &&
        borrowing.students &&
        borrowing.students.length > 1 && (
          <div className="border-t pt-3">
            <p className="text-xs text-gray-500 mb-2">Group Members:</p>
            <div className="flex flex-wrap gap-2">
              {borrowing.students.map((s, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center px-2 py-1 bg-gray-100 rounded-full text-xs text-gray-700"
                >
                  <Users className="h-3 w-3 mr-1" />
                  {s.fullName}
                </span>
              ))}
            </div>
          </div>
        )}

      <div className="mt-4 pt-3 border-t flex justify-between items-center text-xs text-gray-500">
        <span>
          Borrowed on{" "}
          {new Date(borrowing.borrowDate).toLocaleDateString("en-IN")}
        </span>
      </div>
    </div>
  );
};

const QuickActions = () => (
  <Card>
    <CardHeader>
      <CardTitle className="text-xl">Quick Actions</CardTitle>
    </CardHeader>
    <CardContent>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <ActionCard
          to="/books"
          color="blue"
          icon={<BookOpen className="h-6 w-6 text-blue-600" />}
          title="Browse Books"
          subtitle="Explore our collection"
        />
        <ActionCard
          to="/my-borrowings"
          color="green"
          icon={<Clock className="h-6 w-6 text-green-600" />}
          title="My Borrowings"
          subtitle="View all borrowings"
        />
        <ActionCard
          to="/my-fines"
          color="red"
          icon={<IndianRupee className="h-6 w-6 text-red-600" />}
          title="My Fines"
          subtitle="Check pending fines"
        />
        <ActionCard
          to="/review"
          color="yellow"
          icon={<TrendingUp className="h-6 w-6 text-yellow-600" />}
          title="Submit Review"
          subtitle="Share your feedback"
        />
      </div>
    </CardContent>
  </Card>
);

const ActionCard = ({
  to,
  color,
  icon,
  title,
  subtitle,
}: {
  to: string;
  color: string;
  icon: React.ReactNode;
  title: string;
  subtitle: string;
}) => (
  <Link to={to} className="group">
    <div
      className={`border-2 border-${color}-200 rounded-xl p-4 hover:border-${color}-500 hover:shadow-md transition-all text-center`}
    >
      <div
        className={`inline-flex items-center justify-center w-12 h-12 bg-${color}-100 rounded-lg mb-3 group-hover:bg-${color}-200 transition-colors`}
      >
        {icon}
      </div>
      <h3 className="font-semibold text-gray-800 mb-1">{title}</h3>
      <p className="text-xs text-gray-500">{subtitle}</p>
    </div>
  </Link>
);
