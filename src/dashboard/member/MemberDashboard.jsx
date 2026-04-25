import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  User as UserIcon, Mail, MapPin, CreditCard, Loader2, Award, LogOut, Calendar, Phone, Heart
} from "lucide-react";
import logo from "../../assets/logo.png";

// Firebase
import { auth, db } from "../../firebase/firebase";
import { signOut } from "firebase/auth";
import { onSnapshot, collection, query, where } from "firebase/firestore";
import { useAuth } from "../../context/AuthContext";

// Components
import IdCardTemplate from "../../components/shared/IdCardTemplate";
import CertificateTemplate from "../../components/shared/CertificateTemplate";
import IdCardGenerator from "../../components/shared/IdCardGenerator";

const MemberDashboard = ({ initialTab = "profile" }) => {
  const navigate = useNavigate();
  const { user: authUser } = useAuth();

  const [activeTab, setActiveTab] = useState(initialTab);
  const [isLoading, setIsLoading] = useState(true);
  const [showThanks, setShowThanks] = useState(false);

  const [userData, setUserData] = useState(null);
  const [formattedDocsData, setFormattedDocsData] = useState(null);

  useEffect(() => {
    if (!authUser?.email) {
      navigate("/member/login");
      return;
    }

    const q = query(
      collection(db, "membershipApplications"),
      where("email", "==", authUser.email.trim().toLowerCase()),
      where("status", "==", "Approved")
    );

    const unsubscribe = onSnapshot(
      q,
      { includeMetadataChanges: true }, // 🔥 important
      (snapshot) => {
        if (!snapshot.empty) {
          const docSnap = snapshot.docs[0];
          const data = docSnap.data();

          // 🔥 ADMIN PRIORITY DESIGNATION
          const manualPost = data.designation;
          const levelLabel =
            data.membershipLabel ||
            (data.membershipLevel === "national"
              ? "National Level"
              : data.membershipLevel === "state"
              ? "State Level"
              : "District Level");

          const finalDesignation =
            manualPost && manualPost.trim() !== ""
              ? manualPost
              : levelLabel;

          // Dates
          const issueDate = data.createdAt?.toDate
            ? data.createdAt.toDate()
            : new Date(data.createdAt || Date.now());

          const validUntil = new Date(issueDate);
          validUntil.setFullYear(validUntil.getFullYear() + 2);

          // 🔥 FINAL OBJECT (THIS GOES TO PDF)
          const processed = {
            name: data.fullName || data.name || "",
            designation: finalDesignation,
            idNumber: data.memberId || "PENDING",
            phone: data.mobile || data.phone || "N/A",
            joinedSince: issueDate.toLocaleDateString("en-GB"),
            validUntil: validUntil.toLocaleDateString("en-GB"),
            address: data.address || "N/A",
            photo: data.photoUrl || "",
          };

          console.log("LIVE DATA:", processed); // DEBUG

          setUserData({ id: docSnap.id, ...data });
          setFormattedDocsData(processed);
        }

        setIsLoading(false);
      },
      (err) => {
        console.error(err);
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, [authUser, navigate]);

  const handleLogout = async () => {
    setShowThanks(true);
    setTimeout(async () => {
      await signOut(auth);
      localStorage.clear();
      navigate("/", { replace: true });
      window.location.reload();
    }, 2000);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-red-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8f9fa]">
      <AnimatePresence>
        {showThanks && (
          <motion.div className="fixed inset-0 bg-[#002B5B] flex items-center justify-center">
            <div className="bg-white p-10 rounded-3xl text-center">
              <Heart className="text-red-600 mx-auto mb-3" />
              <h2 className="font-black text-xl">Thank You</h2>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* HEADER */}
      <header className="bg-[#002B5B] text-white p-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <img src={logo} className="w-10" />
          <h1 className="font-bold">Member HQ</h1>
        </div>

        <button
          onClick={handleLogout}
          className="bg-red-600 px-4 py-2 rounded-lg flex gap-2 items-center"
        >
          <LogOut size={16} /> Logout
        </button>
      </header>

      {/* BODY */}
      <div className="p-6 max-w-6xl mx-auto">

        {/* TABS */}
        <div className="flex gap-4 mb-6">
          <button onClick={() => setActiveTab("profile")}>Profile</button>
          <button onClick={() => setActiveTab("documents")}>Documents</button>
        </div>

        {/* PROFILE */}
        {activeTab === "profile" && (
          <div className="grid md:grid-cols-2 gap-6">

            <div className="bg-white p-6 rounded-xl text-center">
              <img
                src={formattedDocsData?.photo}
                className="w-32 h-32 object-cover mx-auto rounded-xl"
              />

              <h2 className="font-bold mt-3">
                {formattedDocsData?.name}
              </h2>

              <p className="text-red-600 font-bold">
                {formattedDocsData?.designation}
              </p>

              <p>{formattedDocsData?.idNumber}</p>
            </div>

            <div className="bg-white p-6 rounded-xl">
              <p>Email: {userData?.email}</p>
              <p>Phone: {formattedDocsData?.phone}</p>
              <p>Address: {formattedDocsData?.address}</p>
              <p>
                Valid: {formattedDocsData?.joinedSince} -{" "}
                {formattedDocsData?.validUntil}
              </p>
            </div>

          </div>
        )}

        {/* DOCUMENTS */}
        {activeTab === "documents" && (
          <div className="grid md:grid-cols-2 gap-6">

            <div className="bg-white p-6 rounded-xl text-center">
              <IdCardTemplate member={formattedDocsData} />

              <div className="mt-4">
                {/* 🔥 FINAL FIX */}
                <IdCardGenerator
                  key={JSON.stringify(formattedDocsData)}
                  member={formattedDocsData}
                />
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl text-center">
              <CertificateTemplate data={formattedDocsData} />
            </div>

          </div>
        )}

      </div>
    </div>
  );
};

export default MemberDashboard;