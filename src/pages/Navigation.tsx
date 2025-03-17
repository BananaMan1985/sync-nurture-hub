
import React from 'react';
import Layout from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Navigation as NavigationIcon, MapPin, Compass } from 'lucide-react';
import { motion } from 'framer-motion';

const Navigation: React.FC = () => {
  return (
    <Layout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="container mx-auto px-4 md:px-6"
      >
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Navigation</h1>
          <p className="text-muted-foreground mt-1">
            Maps, directions, and location services
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
          <Card>
            <CardHeader className="pb-2">
              <div className="bg-primary/10 p-2 w-fit rounded-full mb-2">
                <MapPin className="h-5 w-5 text-primary" />
              </div>
              <CardTitle>Favorite Locations</CardTitle>
              <CardDescription>Quick access to frequently visited places</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Add and organize locations you visit frequently for easy navigation.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <div className="bg-primary/10 p-2 w-fit rounded-full mb-2">
                <Compass className="h-5 w-5 text-primary" />
              </div>
              <CardTitle>Route Planning</CardTitle>
              <CardDescription>Plan efficient routes for your day</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Optimize travel time between multiple locations and appointments.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <div className="bg-primary/10 p-2 w-fit rounded-full mb-2">
                <NavigationIcon className="h-5 w-5 text-primary" />
              </div>
              <CardTitle>Traffic Updates</CardTitle>
              <CardDescription>Real-time traffic information</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Get notified about traffic conditions on your regular routes.
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="text-center text-muted-foreground text-sm mt-12">
          This feature is currently in development. Check back soon for updates.
        </div>
      </motion.div>
    </Layout>
  );
};

export default Navigation;
