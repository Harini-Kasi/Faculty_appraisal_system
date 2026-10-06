export default function DepartmentAppraisal() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({});
  const [expanded, setExpanded] = useState({});
  const [info, setInfo] = useState({ name: "", dept: "", designation: "" });
  const [specialSkills, setSpecialSkills] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const sectionRefs = React.useRef({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [successPopup, setSuccessPopup] = useState({ show: false, message: "" });
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
      // Validate and sanitize form data to match current field definitions
      const validateFormData = (data) => {
        const validatedData = { ...data };
        
        SECTION_FIELDS.forEach((field) => {
          if (validatedData[field.key]) {
            const row = validatedData[field.key];
            // Check if the current rating exists in the field's ratings
            const ratingExists = field.ratings.some(
              (r) => r.label === row.rating?.label && r.score === row.rating?.score
            );
            
            // If rating doesn't exist, clear it
            if (!ratingExists && row.rating) {
              validatedData[field.key] = {
                ...row,
                rating: null,
                score: "",
              };
            }
          }
        });
        
        return validatedData;
      };

    const loadFormData = async () => {
      const storedUser = localStorage.getItem("user");
      if (!storedUser) {
        setLoadingData(false);
        return;
      }

      try {
        const userData = JSON.parse(storedUser);
        setUser(userData);
        const token = localStorage.getItem("token");

        // Fetch faculty info (non-blocking)
        try {
          const facultyResponse = await axios.get(
            `https://nec.edu.in/fpas/faculty/${userData.username}`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          setInfo({
            name: facultyResponse.data.name || "",
            dept: facultyResponse.data.department || "",
            designation: facultyResponse.data.designation || "",
          });
        } catch (error) {
          console.error("Error fetching faculty data:", error);
          setInfo({
            name: userData.name || "",
            dept: userData.department || "",
            designation: userData.designation || "",
          });
        }

        // Try submitted appraisal first
        try {
          const submittedResponse = await axios.get(
            `https://nec.edu.in/fpas/faculty/department-appraisal/${userData.username}`,
            { headers: { Authorization: `Bearer ${token}` } }
          );

          if (submittedResponse.data?.data) {
            setIsSubmitted(true);
            const validatedData = validateFormData(submittedResponse.data.data.form_data || {});
            setFormData(validatedData);
            setSpecialSkills(submittedResponse.data.data.special_skills || "");
          }
        } catch (submittedError) {
          if (submittedError.response?.status === 404) {
            // No submitted appraisal — try loading draft
            try {
              const draftResponse = await axios.get(
                `https://nec.edu.in/fpas/faculty/department-appraisal-draft/${userData.username}`,
                { headers: { Authorization: `Bearer ${token}` } }
              );

              if (draftResponse.data?.data) {
                const validatedData = validateFormData(draftResponse.data.data.form_data || {});
                setFormData(validatedData);
                setSpecialSkills(draftResponse.data.data.special_skills || "");
              }
            } catch (draftError) {
              if (draftError.response?.status !== 404) {
                console.error("Error loading draft data:", draftError);
              }
              // 404 on draft = fresh empty form, do nothing
            }
          } else {
            console.error("Error loading submitted appraisal:", submittedError);
          }
        }
      } catch (error) {
        console.error("Error parsing user data:", error);
      } finally {
        setLoadingData(false);
      }
    };

    loadFormData();
  }, []);

  // useEffect(() => {
  //   if (isSubmitted || Object.keys(formData).length === 0) {
  //     return;
  //   }

  //   const autosaveInterval = setInterval(() => {
  //     const token = localStorage.getItem("token");
  //     axios.post(
  //       "https://nec.edu.in/fpas/faculty/department-appraisal-draft",
  //       {
  //         formData,
  //         specialSkills,
  //         info,
  //         submittedBy: user?.username,
  //         isDraft: true,
  //       },
        
  //       { headers: { Authorization: `Bearer ${token}` } }
  //     )
  //       .then(() => {
  //         console.log("Autosave successful at", new Date().toLocaleTimeString());
  //       })
  //       .catch((error) => {
  //         console.error("Autosave failed:", error);
  //       });
  //   }, 3 * 60 * 1000);

  //   return () => clearInterval(autosaveInterval);
  // }, [formData, specialSkills, info, user?.username, isSubmitted]);
  
  useEffect(() => {
    // Only autosave if not submitted AND (has form data OR has special skills)
    if (isSubmitted || (Object.keys(formData).length === 0 && !specialSkills.trim())) {
      return;
    }

    const autosaveInterval = setInterval(() => {
      const token = localStorage.getItem("token");
      if (!user?.username || !info.dept) {
        return; // Skip if user data not ready
      }

      axios.post(
        "https://nec.edu.in/fpas/faculty/department-appraisal-draft",
        {
          formData,
          specialSkills,
          info,
          submittedBy: user?.username,
          isDraft: true,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      )
        .then(() => {
          console.log("✅ Autosave successful at", new Date().toLocaleTimeString());
        })
        .catch((error) => {
          console.error("❌ Autosave failed:", error);
        });
    }, 3 * 60 * 1000); // Every 3 minutes

    return () => clearInterval(autosaveInterval);
  }, [formData, specialSkills, info, user?.username, isSubmitted]);


  const toggle = (id) => {
    setExpanded((prev) => {
      if (prev[id]) {
        return {};
      }
      const newExpanded = { [id]: true };
      setTimeout(() => {
        sectionRefs.current[id]?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 0);
      return newExpanded;
    });
  };

  const handleChangePassword = async () => {
    if (!newPassword || newPassword.trim() === "") {
      setError("Please enter a valid password.");
      setTimeout(() => setError(""), 3000);
      return;
    }
    setLoading(true);
    try {
      await axios.post(
        "https://nec.edu.in/fpas/faculty/changepassword",
        { userId: user.username, newPassword: newPassword.trim() },
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );
      setSuccess("Password changed successfully!");
      setShowPasswordModal(false);
      setNewPassword("");
      setTimeout(() => setSuccess(""), 3000);
    } catch (error) {
      setError(error.response?.data?.message || "Error changing password");
      setTimeout(() => setError(""), 3000);
    } finally {
      setLoading(false);
    }
  };

  const calculateTotalScore = React.useMemo(() => {
    let total = 0;
    Object.keys(formData).forEach((key) => {
      const score = parseInt(formData[key]?.score) || 0;
      total += score;
    });

    const divisionScore = DIVISION_SCORES[info.dept] || 1;
    const finalScore = (total / divisionScore) * 100;

    return parseFloat(finalScore.toFixed(2));
  }, [formData, info.dept]);

  const handleSave = async () => {
      // Add validation check
    if (!user?.username) {
      setError("User data is still loading. Please wait and try again.");
      setTimeout(() => setError(""), 3000);
      return;
    }
    
    if (!info.dept) {
      setError("Department information is missing.");
      setTimeout(() => setError(""), 3000);
      return;
    }
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        "https://nec.edu.in/fpas/faculty/department-appraisal-draft",
        { formData, specialSkills, info, submittedBy: user?.username, isDraft: true },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSuccessPopup({ show: true, message: "Draft saved successfully!" });
      setTimeout(() => setSuccessPopup({ show: false, message: "" }), 3000);
    } catch (error) {
      setError("Error saving form");
      setTimeout(() => setError(""), 3000);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
      // Add validation check
    if (!user?.username) {
      setError("User data is still loading. Please wait and try again.");
      setTimeout(() => setError(""), 3000);
      return;
    }
    
    if (!info.dept) {
      setError("Department information is missing.");
      setTimeout(() => setError(""), 3000);
      return;
    }
    setLoading(true);
    try {
      const token = localStorage.getItem("token");

      const now = new Date();
      const formattedDate = `${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()}`;

      await axios.post(
        "https://nec.edu.in/fpas/faculty/department-appraisal",
        { formData, specialSkills, info, submittedBy: user?.username, submittedDate: formattedDate },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSuccessPopup({ show: true, message: "Form submitted successfully!" });
      setTimeout(() => navigate("/hod"), 2000);
    } catch (error) {
      setError(error.response?.data?.message || "Error submitting form");
      setTimeout(() => setError(""), 3000);
    } finally {
      setLoading(false);
    }
  };

  const PreviewModal = () => {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl shadow-xl p-8 w-full max-w-6xl my-8 max-h-[90vh] overflow-y-auto">
          <h2 className="text-3xl font-bold mb-6 text-gray-900">Form Preview</h2>

          <div className="mb-8 p-6 bg-gray-50 rounded-lg border border-gray-300">
            <h3 className="text-xl font-bold mb-4 text-gray-800">Faculty Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-gray-600 font-semibold">Name</p>
                <p className="text-lg text-gray-900">{info.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 font-semibold">Department</p>
                <p className="text-lg text-gray-900">{info.dept}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 font-semibold">Designation</p>
                <p className="text-lg text-gray-900">{info.designation}</p>
              </div>
            </div>
          </div>

          <div className="mb-8 space-y-6">
            {SECTIONS.map((section) => (
              <div key={section.id} className="border border-gray-300 rounded-lg p-6 bg-white">
                <h3 className="text-xl font-bold text-gray-800 mb-4">{section.title}</h3>

                {section.subsections && section.subsections.map((subsection, idx) => (
                  <div key={idx} className="mb-6">
                    <h4 className="text-lg font-semibold text-gray-700 mb-3">{subsection.title}</h4>
                    <div className="space-y-3">
                      {subsection.fields && subsection.fields.map((field) => (
                        <div key={field.key} className="bg-gray-50 p-4 rounded mb-3">
                          <p className="text-sm font-semibold text-gray-700 mb-3">{field.name}</p>
                          <div className="grid grid-cols-4 gap-4 mb-3">
                            <div>
                              <span className="text-xs text-gray-500">Target:</span>
                              <p className="text-gray-900 font-semibold">{formData[field.key]?.target || 'N/A'}</p>
                            </div>
                            <div>
                              <span className="text-xs text-gray-500">Achievement:</span>
                              <p className="text-gray-900 font-semibold">{formData[field.key]?.achievement || 'N/A'}</p>
                            </div>
                            <div>
                              <span className="text-xs text-gray-500">Rating:</span>
                              <p className="text-gray-900 font-semibold">{formData[field.key]?.rating?.label || 'N/A'}</p>
                            </div>
                            <div>
                              <span className="text-xs text-gray-500">Score:</span>
                              <p className="text-gray-900 font-semibold">{formData[field.key]?.score || 0}</p>
                            </div>
                          </div>
                          <div className="bg-white p-3 rounded border border-gray-200">
                            <span className="text-xs text-gray-500 block mb-1">Evidence:</span>
                            <p className="text-gray-700 text-sm whitespace-pre-wrap">{formData[field.key]?.evidence || 'N/A'}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>

          <div className="mb-8 p-6 bg-gray-50 rounded-lg border border-gray-300">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Special Achievements / Rewards / Awards</h3>
            <p className="text-gray-900 text-base whitespace-pre-wrap">{specialSkills || 'N/A'}</p>
          </div>

          <div className="mb-8 p-6 bg-blue-100 rounded-lg border border-blue-300">
            <p className="text-sm text-blue-800 font-bold mb-2">Total Score</p>
            <p className="text-4xl font-bold text-blue-900">{calculateTotalScore.toFixed(2)}</p>
          </div>

          <div className="flex gap-4 justify-end">
            <button
              onClick={() => setShowPreview(false)}
              className="bg-gray-300 text-gray-800 font-bold py-3 px-8 rounded-lg hover:bg-gray-400"
            >
              Back to Edit
            </button>
            <button
              onClick={() => {
                setShowPreview(false);
                handleSubmit();
              }}
              className="bg-green-600 text-white font-bold py-3 px-8 rounded-lg hover:bg-green-700"
              disabled={loading}
            >
              {loading ? "Submitting..." : "Confirm & Submit"}
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <header className="bg-white shadow-md mb-1">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-gray-900">Department Performance Appraisal Form</h1>
            <div className="flex space-x-4">
              <button
                onClick={() => navigate("/hod")}
                className="bg-gray-500 text-white px-8 py-3 rounded-lg hover:bg-gray-600 text-lg font-semibold"
                disabled={loading}
              >
                <FontAwesomeIcon icon={faArrowLeft} />
              </button>
              <button
                onClick={() => setShowPasswordModal(true)}
                className="bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700 text-lg font-semibold"
              >
                <FontAwesomeIcon icon={faKey} />
              </button>
              <LogOut />
            </div>
          </div>
        </div>
      </header>

      <div className="flex-1 bg-white py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">

          {showPasswordModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-xl shadow-xl p-8 w-96">
                <h2 className="text-2xl font-bold mb-6 text-gray-800">Change Password</h2>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg mb-4 text-base"
                />
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => setShowPasswordModal(false)}
                    className="bg-gray-300 text-gray-800 px-6 py-2 rounded-lg hover:bg-gray-400"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleChangePassword}
                    disabled={loading}
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
                  >
                    {loading ? "Saving..." : "Save"}
                  </button>
                </div>
              </div>
            </div>
          )}

          {successPopup.show && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-xl shadow-xl p-8 w-80">
                <div className="flex items-center justify-center mb-4">
                  <div className="text-green-500 text-4xl">✓</div>
                </div>
                <p className="text-center text-lg font-semibold text-gray-800">
                  {successPopup.message}
                </p>
              </div>
            </div>
          )}

          {showPreview && <PreviewModal />}

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 font-medium">
              {error}
            </div>
          )}
          {success && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700 font-medium">
              {success}
            </div>
          )}

          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="text-yellow-900 font-semibold">⚠️ Note:
              <ol type="1" className="list-decimal list-inside mt-2 text-yellow-900">
                <li>Please click SAVE BUTTON then and there in order to avoid session timeout</li>
                <li>Please choose Not Applicable if the target is not allotted</li>
                <li>The Target and Achievement value should be number, do not use % or comma(,) and other operators</li>
                <li>Decimals can be used in target and achievement with scale '2'</li>
                <li>In evidence box, please limit your inputs into 350 characters</li>
              </ol>
            </div>
          </div>

          <div className="mb-8 p-6 bg-white rounded-lg shadow-md border border-gray-300">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2 uppercase">Name</label>
                <input
                  type="text"
                  value={info.name}
                  readOnly
                  className="w-full px-4 py-3 border border-gray-300 rounded bg-gray-50 text-base"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2 uppercase">Department</label>
                <input
                  type="text"
                  value={info.dept}
                  readOnly
                  className="w-full px-4 py-3 border border-gray-300 rounded bg-gray-50 text-base"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2 uppercase">Designation</label>
                <input
                  type="text"
                  value={info.designation}
                  readOnly
                  className="w-full px-4 py-3 border border-gray-300 rounded bg-gray-50 text-base"
                />
              </div>
            </div>
          </div>

          <div className="space-y-6 mb-8">
            {SECTIONS.map((section) => (
              <Section
                key={section.id}
                ref={(el) => sectionRefs.current[section.id] = el}
                section={section}
                data={formData}
                setData={setFormData}
                expanded={!!expanded[section.id]}
                onToggle={() => toggle(section.id)}
                disabled={isSubmitted}
              />
            ))}
          </div>

          <div className="bg-white rounded-lg shadow-md p-8 mb-8 border border-gray-300">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <label className="block text-lg font-bold text-gray-800 mb-4 uppercase">
                  Special Achievements / Rewards / Awards
                </label>
                <textarea
                  rows={5}
                  maxLength={500}
                  value={specialSkills}
                  onChange={(e) => setSpecialSkills(e.target.value)}
                  disabled={isSubmitted}
                  placeholder="Please provide details with evidences..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg text-base"
                />
              </div>
              <div className="bg-blue-100 rounded-lg p-8 flex flex-col justify-center shadow-md border border-gray-300">
                <p className="text-sm uppercase font-bold mb-3">Total Score</p>
                <p className="text-5xl font-bold">{calculateTotalScore.toFixed(2)}</p>
              </div>
            </div>
          </div>

          <div className="flex gap-4 justify-end mb-8">
            <button
              onClick={() => navigate("/hod")}
              className="bg-blue-100 text-gray-800 font-bold py-3 px-8 rounded-lg"
              disabled={loading}
            >
              Back
            </button>
            <button
              onClick={handleSave}
              className="bg-blue-500 text-white font-bold py-3 px-8 rounded-lg"
              disabled={loading || isSubmitted}
            >
              {loading ? "Saving..." : "Save"}
            </button>
            <button
              onClick={() => setShowPreview(true)}
              className="bg-red-800 text-white font-bold py-3 px-8 rounded-lg hover:bg-green-700"
              disabled={loading || isSubmitted}
            >
              Preview & Submit
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}


