import React, { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import AnimatedTransition from "@/components/AnimatedTransition";
import ReportForm from "@/components/ReportForm";
import ReportHistory from "@/components/ReportHistory";
import { createClient } from "@supabase/supabase-js";
import { useToast } from "@/hooks/use-toast";

// Initialize Supabase client
const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

const Reports: React.FC = () => {
  const [userRole, setUserRole] = useState<string | null>(null);
  const { toast } = useToast();

  // Fetch user role on mount
  useEffect(() => {
    const fetchUserRole = async () => {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();
      if (error) {
        console.error("Error fetching user:", error);
        toast({
          variant: "destructive",
          title: "Authentication Error",
          description: "Could not verify user. Please log in again.",
        });
        return;
      }
      if (user) {
        setUserRole(user.user_metadata.role || null);
      } else {
        toast({
          variant: "destructive",
          title: "Not Logged In",
          description: "Please log in to access reports.",
        });
      }
    };
    fetchUserRole();
  }, [toast]);

  return (
    <Layout>
      <AnimatedTransition>
        <div className="container mx-auto px-4 md:px-6 py-8">
          <div className="max-w-2xl mx-auto text-center mb-8">
            <h1 className="mb-4 text-4xl font-medium tracking-tight">
              End-of-Day Reports
                </h1>
                {userRole==="assistant" && <p className="text-muted-foreground text-lg">
                  Summarize your day, stay aligned, and plan effectively.
                  <br />
                  <span className="text-sm font-medium mt-1 inline-block">
                    Reports can be viewed for any date but can only be submitted for
                    the current day and up to 7 days in the past.
                    <span className="text-destructive ml-1">
                      All fields are required.
                    </span>
                  </span>
                </p>}
            
          </div>

          <div className="max-w-3xl mx-auto mt-8">
            {userRole === null ? (
              <p className="text-center text-muted-foreground">
                Loading user role...
              </p>
            ) : (
              <>
               {userRole==="assistant" && <ReportForm />} 
                {userRole === "executive" && <ReportHistory />}{" "}
                {/* Show ReportHistory only for executives */}
              </>
            )}
          </div>
        </div>
      </AnimatedTransition>
    </Layout>
  );
};

export default Reports;
