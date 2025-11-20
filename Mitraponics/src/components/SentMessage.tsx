"use client";

import React, { useState, ChangeEvent, FormEvent } from "react";
import { Facebook, Instagram, Twitter } from "lucide-react";
import { PiPhoneCallFill } from "react-icons/pi";
import { RiMailFill } from "react-icons/ri";
import { HiLocationMarker } from "react-icons/hi";

const ContactForm: React.FC = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    message: "",
  });

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const sendMessage = (e: FormEvent) => {
    e.preventDefault();

    const { firstName, lastName, email, phone, message } = formData;
    const adminNumber = "6285880590854";
    const whatsappMessage = `Hello, my name is ${firstName} ${lastName}.
Email: ${email}
Phone: ${phone}
Message: ${message}`;

    const whatsappUrl = `https://wa.me/${adminNumber}?text=${encodeURIComponent(whatsappMessage)}`;
    window.open(whatsappUrl, "_blank");
  };

  return (
    <section className="flex justify-center items-center min-h-screen bg-gray-100 px-4">
      <div className="bg-white rounded-lg shadow-lg max-w-4xl w-full flex overflow-hidden flex-col md:flex-row">

        {/* Left Side - Contact Information */}
        <div className="p-8 w-full md:w-1/2 bg-teal-100 flex flex-col">
          {/* Move H2 and P Up and Align Left */}
          <div className="mt-auto">
            <h2 className="text-2xl font-semibold text-gray-800 text-left">Contact Information</h2>
            <p className="text-gray-600 text-left">Say something to start a live chat!</p>
          </div>

          {/* Center Contact Info in the Middle but Keep Left-Aligned */}
          <div className="flex-grow flex flex-col justify-center space-y-6 text-gray-700">
            <div className="flex items-center gap-3">
              <PiPhoneCallFill /> <span>+1012 3456 789</span>
            </div>
            <div className="flex items-center gap-3">
              <RiMailFill /> <span>demo@gmail.com</span>
            </div>
            <div className="flex items-center gap-3">
              <HiLocationMarker />
              <span>132 Dartmouth Street, Boston, MA 02156, USA</span>
            </div>
          </div>

          {/* Social Icons Matching Footer */}
          <div className="flex gap-4 mt-auto">
            <a href="#" className="border border-gray-400 rounded-full p-2 text-gray-600 hover:text-black">
              <Facebook size={20} />
            </a>
            <a href="#" className="border border-gray-400 rounded-full p-2 text-gray-600 hover:text-black">
              <Instagram size={20} />
            </a>
            <a href="#" className="border border-gray-400 rounded-full p-2 text-gray-600 hover:text-black">
              <Twitter size={20} />
            </a>
          </div>
        </div>

        {/* Right Side - Contact Form */}
        <div className="p-8 w-full md:w-1/2 bg-white">
          <h2 className="text-2xl font-semibold text-gray-800 text-center">Message Us</h2>
          <p className="text-gray-500 text-center mb-6">
            Any questions or remarks? Just write us a message!
          </p>

          <form className="space-y-4" onSubmit={sendMessage}>
            <div className="flex gap-4">
              <div className="w-1/2">
                <label className="block text-sm font-medium text-gray-700">First Name</label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                  className="w-full p-2 border-b border-gray-300 outline-none focus:border-black"
                />
              </div>
              <div className="w-1/2">
                <label className="block text-sm font-medium text-gray-700">Last Name</label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  required
                  className="w-full p-2 border-b border-gray-300 outline-none focus:border-black"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full p-2 border-b border-gray-300 outline-none focus:border-black"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Phone Number</label>
              <input
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                required
                className="w-full p-2 border-b border-gray-300 outline-none focus:border-black"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Message</label>
              <textarea
                name="message"
                value={formData.message}
                onChange={handleChange}
                required
                className="w-full p-2 border-b border-gray-300 outline-none focus:border-black"
                placeholder="Write your message..."
                rows={3}
              ></textarea>
            </div>

            <button
              type="submit"
              className="w-full bg-teal-200 text-gray-700 py-2 rounded-lg hover:bg-teal-300 transition"
            >
              Send Message
            </button>
          </form>
        </div>

      </div>
    </section>
  );
};

export default ContactForm;
