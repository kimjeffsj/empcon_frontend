import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, CheckCircle, XCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { LeaveRequest } from "@/api/leave/leaveApi.types";
import { formatToVancouverTime } from "@/utils/dateUtils";

interface PendingRequestsCardProps {
  isLoading: boolean;
  pendingRequests: LeaveRequest[];
}

export const PendingRequestsCard = ({
  isLoading,
  pendingRequests,
}: PendingRequestsCardProps) => {
  const navigate = useNavigate();

  const handleViewAll = () => {
    navigate("/leaves");
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <AlertCircle className="mr-2 h-5 w-5" />
            Pending Requests
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-40">
            <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center">
          <AlertCircle className="mr-2 h-5 w-5" />
          Pending Requests
        </CardTitle>
        <Button variant="outline" size="sm" onClick={handleViewAll}>
          View All
        </Button>
      </CardHeader>
      <CardContent>
        {pendingRequests.length > 0 ? (
          <div className="space-y-4">
            {pendingRequests.map((request) => (
              <div key={request.id} className="border rounded-md p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-medium">
                      {request.user?.firstName} {request.user?.lastName}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {request.leaveType?.name} (
                      {formatToVancouverTime(
                        new Date(request.startDate),
                        "yyyy-MM-dd"
                      )}{" "}
                      ~{" "}
                      {formatToVancouverTime(
                        new Date(request.endDate),
                        "yyyy-MM-dd"
                      )}
                      )
                    </div>
                    {request.notes && (
                      <div className="text-sm mt-2">{request.notes}</div>
                    )}
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 text-green-500"
                    >
                      <CheckCircle className="h-5 w-5" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 text-red-500"
                    >
                      <XCircle className="h-5 w-5" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex items-center justify-center h-40 text-muted-foreground">
            No other pending requests
          </div>
        )}
      </CardContent>
    </Card>
  );
};
