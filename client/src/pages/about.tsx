import AppLayout from "@/components/layouts/AppLayout";

const AboutPage = () => {
  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8 text-primary">About SweetCraft Bakery</h1>
        
        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          <h2 className="text-2xl font-semibold mb-4">Our Story</h2>
          <p className="mb-4">
            SweetCraft Bakery began in 2010 as a small family operation, born from a passion for creating delicious,
            handcrafted treats. What started as weekend baking for friends and family quickly grew into a beloved 
            local bakery known for its attention to detail and commitment to quality.
          </p>
          <p className="mb-4">
            Over the years, we've expanded our offerings while staying true to our core values: using only the finest 
            ingredients, crafting each item with care, and providing exceptional service to our customers.
          </p>
          <p>
            Today, SweetCraft Bakery has grown to serve customers nationwide through our online platform,
            while maintaining the same dedication to craftsmanship that defined us from day one.
          </p>
        </div>
        
        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          <h2 className="text-2xl font-semibold mb-4">Our Mission</h2>
          <p className="mb-4">
            At SweetCraft Bakery, our mission is to bring joy through exceptional baked goods that celebrate 
            life's special moments. We believe that every occasion deserves something sweet, crafted with care and attention.
          </p>
          <p>
            We're committed to:
          </p>
          <ul className="list-disc pl-6 mt-2 space-y-2">
            <li>Using only premium, ethically sourced ingredients</li>
            <li>Supporting local suppliers whenever possible</li>
            <li>Creating inclusive options for various dietary needs</li>
            <li>Reducing our environmental footprint through sustainable practices</li>
            <li>Giving back to our community through charitable initiatives</li>
          </ul>
        </div>
        
        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          <h2 className="text-2xl font-semibold mb-4">Our Team</h2>
          <p className="mb-4">
            Our talented team consists of passionate bakers, skilled decorators, and dedicated service staff who all
            share a common love for creating memorable experiences through food.
          </p>
          <p className="mb-4">
            Led by our head baker and founder, Maria Johnson, our team brings together decades of combined experience
            in traditional baking techniques and innovative culinary approaches.
          </p>
          <p>
            From our junior bakers who are mastering the craft to our master decorators who create edible works of art,
            every member of the SweetCraft family plays a crucial role in delivering excellence.
          </p>
        </div>
        
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-2xl font-semibold mb-4">Visit Us</h2>
          <p className="mb-4">
            While we primarily serve customers through our online platform, we welcome visitors to our main
            bakery location in downtown Sweetville.
          </p>
          <div className="bg-muted p-4 rounded-lg">
            <p className="font-medium">SweetCraft Bakery Main Location</p>
            <p>123 Maple Street</p>
            <p>Sweetville, SC 12345</p>
            <p className="mt-2">Hours: Tuesday - Sunday, 7am - 6pm</p>
            <p>Phone: (555) 123-4567</p>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default AboutPage;