"use client";

import React, { useRef } from "react";
import { ChevronLeftCircle, ChevronRightCircle } from "lucide-react";

const testimonials = [
  {
    id: 1,
    quote:
      "Jorem ipsum dolor sit amet, consectetur adipiscing elit. Nunc vulputate libero et velit interdum, ac aliquet odio mattis. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos.",
    name: "John Doe",
    role: "Youtuber",
    rating: 4.5,
  },
  {
    id: 2,
    quote:
      "Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium. Totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.",
    name: "Jane Smith",
    role: "Content Creator",
    rating: 5.0,
  },
  {
    id: 3,
    quote:
      "Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt.",
    name: "Alex Johnson",
    role: "Blogger",
    rating: 4.7,
  },
  {
    id: 4,
    quote:
      "Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt.",
    name: "Brian Wood",
    role: "Customer",
    rating: 4.8,
  },
];

const Testimonials = () => {
  const sliderRef = useRef<HTMLDivElement>(null);

  const scrollLeft = () => {
    if (sliderRef.current) {
      sliderRef.current.scrollBy({ left: -400, behavior: "smooth" });
    }
  };

  const scrollRight = () => {
    if (sliderRef.current) {
      sliderRef.current.scrollBy({ left: 400, behavior: "smooth" });
    }
  };

  return (
    <section className="h-[80vh] py-20 bg-white relative flex items-center">
      <div className="max-w-6xl mx-auto px-6 relative flex items-center">
        {/* Left Button Outside */}
        <button
          onClick={scrollLeft}
          className="absolute -left-16 top-1/2 -translate-y-1/2 text-gray-200 hover:text-gray-700 transition-colors"
        >
          <ChevronLeftCircle size={48} />
        </button>

        <div className="w-full">
          <h2 className="text-3xl font-bold mb-8 text-center">
            What customers say about{" "}
            <span className="text-green-600">MITRAPONICS</span>
          </h2>
          <div
            ref={sliderRef}
            className="overflow-x-auto whitespace-nowrap scrollbar-hide scroll-smooth"
          >
            <div className="flex gap-6">
              {testimonials.map((testimonial) => (
                <div
                  key={testimonial.id}
                  className="min-w-[600px] p-6 bg-teal-100 rounded-lg shadow-md flex flex-col justify-between overflow-visible"
                >
                  <div>
                    <div className="text-4xl text-black">“</div>
                    <p className="text-gray-700 mb-4 break-words whitespace-normal">
                      {testimonial.quote}
                    </p>
                  </div>
                  <div>
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-bold">{testimonial.name}</p>
                        <p className="text-gray-500">{testimonial.role}</p>
                      </div>
                      <div className="flex items-center gap-1 text-black">
                        <span>⭐</span>
                        <span>{testimonial.rating}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Button Outside */}
        <button
          onClick={scrollRight}
          className="absolute -right-16 top-1/2 -translate-y-1/2 text-gray-200 hover:text-gray-700 transition-colors"
        >
          <ChevronRightCircle size={48} />
        </button>
      </div>
    </section>
  );
};

export default Testimonials;
