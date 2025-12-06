import React from "react";

const Index = () => {
  return (
    <div className="flex flex-col items-center justify-center h-full py-16">
      <h1 className="text-5xl font-extrabold tracking-tight lg:text-6xl mb-6 text-foreground">
        Welcome to VerifDoc
      </h1>
      <p className="text-xl text-muted-foreground max-w-2xl text-center mb-8">
        Your clean, conflict-free SaaS frontend is ready. Start building your amazing features here!
      </p>
      {/* You can add more content or components specific to your index page here */}
    </div>
  );
};

export default Index;