
import React from 'react';
import Layout from '@/components/Layout';
import AppMenu from '@/components/AppMenu';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Map, MapPin, Compass, Clock, Navigation2 } from 'lucide-react';
import { Container } from '@/components/ui/container';

const Navigation = () => {
  return (
    <Layout>
      <Container>
        <div className="space-y-6">
          <h1 className="text-3xl font-bold tracking-tight">Navigation</h1>
          <AppMenu />
          
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader className="space-y-1">
                <CardTitle className="text-2xl">Current Route</CardTitle>
                <CardDescription>Your active navigation route</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4 mb-4">
                  <div className="bg-primary/10 p-3 rounded-full">
                    <Navigation2 className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">Office to Client Meeting</p>
                    <p className="text-sm text-muted-foreground">25 minutes via Highway 101</p>
                  </div>
                </div>
                <Button className="w-full">Start Navigation</Button>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="space-y-1">
                <CardTitle className="text-2xl">Saved Locations</CardTitle>
                <CardDescription>Quick access to frequently visited places</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="bg-blue-100 dark:bg-blue-900/20 p-2 rounded-full">
                    <MapPin className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="font-medium">Main Office</p>
                    <p className="text-sm text-muted-foreground">123 Business Ave</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="bg-green-100 dark:bg-green-900/20 p-2 rounded-full">
                    <MapPin className="h-5 w-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <p className="font-medium">Client HQ</p>
                    <p className="text-sm text-muted-foreground">456 Corporate Blvd</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="bg-purple-100 dark:bg-purple-900/20 p-2 rounded-full">
                    <MapPin className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <p className="font-medium">Airport</p>
                    <p className="text-sm text-muted-foreground">International Terminal</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="space-y-1">
                <CardTitle className="text-2xl">Travel Time</CardTitle>
                <CardDescription>Estimated times to destinations</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Clock className="h-5 w-5 text-muted-foreground" /> 
                    <span>Client HQ</span>
                  </div>
                  <span className="font-medium">25 min</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Clock className="h-5 w-5 text-muted-foreground" /> 
                    <span>Airport</span>
                  </div>
                  <span className="font-medium">42 min</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Clock className="h-5 w-5 text-muted-foreground" /> 
                    <span>Home</span>
                  </div>
                  <span className="font-medium">18 min</span>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Map View</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-muted h-[300px] rounded-md flex items-center justify-center border border-border">
                <div className="text-center">
                  <Map className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                  <p className="text-muted-foreground">Interactive map would be displayed here</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </Container>
    </Layout>
  );
};

export default Navigation;
