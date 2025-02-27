import { useState } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function Home() {
  const [project, setProject] = useState({
    name: "",
    duration: "",
    type: "",
    frontendAmount: "",
    backendAmount: 1,
    designerAmount: 1,
    devopsAmount: 1,
    tools: [],
    frontendTech: [],
    backendTech: [],
    functional: "",
    cloud: "",
    cloudAmount: 0,
    currency: "Dollars",
    timeUnit: "Hourly",
    frontendDevs: 1,
    backendDevs: 1,
    designerDevs: 1,
    devopsDevs: 1,
    frontendHours: 1,
    backendHours: 1,
    designerHours: 1,
    devopsHours: 1,
    bufferPercentage: 10,
    miscExpenses: 0,
    paymentTerms: {
      kickoff: 20,
      uiuxCompletion: 20,
      backendDevelopment: 20,
      betaTesting: 20,
      finalDelivery: 20,
    },
  });
  const [newTool, setNewTool] = useState({ name: "", cost: 0 });
  const [result, setResult] = useState(null);
  const [errors, setErrors] = useState({});
  const [pdfOptions, setPdfOptions] = useState({
    overviewFields: {
      projectType: true,
      duration: false,
      functional: false,
      frontendTech: false,
      backendTech: false,
    },
    tables: {
      developmentCosts: true,
      infrastructureCosts: false,
      contingency: false,
      overallBudget: false,
      paymentTerms: false,
    },
  });
  const [isModalOpen, setIsModalOpen] = useState(false);

  const presets = {
    "E-commerce App": {
      frontendDevs: 2,
      backendDevs: 2,
      designerDevs: 1,
      devopsDevs: 1,
      cloud: "Vercel",
      cloudAmount: 20,
      timeUnit: "Hourly",
      frontendHours: 100,
      backendHours: 100,
      designerHours: 30,
      devopsHours: 50,
    },
    "Blog Website": {
      frontendDevs: 1,
      backendDevs: 1,
      designerDevs: 1,
      devopsDevs: 1,
      cloud: "Vercel",
      cloudAmount: 10,
      timeUnit: "Hourly",
      frontendHours: 50,
      backendHours: 25,
      designerHours: 20,
      devopsHours: 30,
    },
  };

  const frontendOptions = [
    "React",
    "Vue.js",
    "Angular",
    "Svelte",
    "HTML/CSS/JS",
  ];
  const backendOptions = [
    "Node.js",
    "Django",
    "Ruby on Rails",
    "Spring Boot",
    "PHP",
  ];

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    const numValue = type === "number" ? Math.max(0, Number(value)) : value;

    if (name.startsWith("payment_")) {
      setProject((prev) => ({
        ...prev,
        paymentTerms: {
          ...prev.paymentTerms,
          [name.replace("payment_", "")]: numValue,
        },
      }));
    } else {
      setProject({ ...project, [name]: numValue });
    }
    validateField(name, numValue);
  };

  const validateField = (name, value) => {
    const newErrors = { ...errors };
    if (
      name.includes("Amount") ||
      name.includes("Devs") ||
      name.includes("Hours") ||
      name.includes("cloudAmount") ||
      name === "miscExpenses"
    ) {
      if (value < 0) {
        newErrors[name] = `${name
          .replace(/([A-Z])/g, " $1")
          .trim()} must be positive`;
      } else {
        delete newErrors[name];
      }
    }
    if (name === "bufferPercentage") {
      if (value < 0 || value > 100) {
        newErrors[name] = "Buffer percentage must be between 0 and 100";
      } else {
        delete newErrors[name];
      }
    }
    if (name.startsWith("payment_")) {
      const term = name.replace("payment_", "");
      if (value < 0 || value > 100) {
        newErrors[name] = `${term} percentage must be between 0 and 100`;
      } else {
        delete newErrors[name];
      }
      const totalPercentage = Object.values({
        ...project.paymentTerms,
        [term]: value,
      }).reduce((sum, val) => sum + Number(val), 0);
      if (totalPercentage !== 100) {
        newErrors.paymentTotal = "Payment percentages must sum to 100%";
      } else {
        delete newErrors.paymentTotal;
      }
    }
    setErrors(newErrors);
  };

  const handlePresetChange = (e) => {
    const preset = presets[e.target.value] || {};
    setProject({
      ...project,
      type: e.target.value,
      frontendDevs: preset.frontendDevs || project.frontendDevs,
      backendDevs: preset.backendDevs || project.backendDevs,
      designerDevs: preset.designerDevs || project.designerDevs,
      devopsDevs: preset.devopsDevs || project.devopsDevs,
      cloud: preset.cloud || project.cloud || "",
      cloudAmount: preset.cloudAmount || project.cloudAmount || 0,
      timeUnit: preset.timeUnit || project.timeUnit,
      frontendHours: preset.frontendHours || project.frontendHours,
      backendHours: preset.backendHours || project.backendHours,
      designerHours: preset.designerHours || project.designerHours,
      devopsHours: preset.devopsHours || project.devopsHours,
    });
    validateAllFields();
  };

  const validateAllFields = () => {
    const newErrors = {};
    Object.keys(project).forEach((key) => {
      if (
        key.includes("Amount") ||
        key.includes("Devs") ||
        key.includes("Hours") ||
        key.includes("cloudAmount")
      ) {
        if (project[key] < 0) {
          newErrors[key] = `${key
            .replace(/([A-Z])/g, " $1")
            .trim()} must be positive`;
        }
      }
    });
    setErrors(newErrors);
  };

  const handleTechChange = (techType) => (e) => {
    const { value, checked } = e.target;
    setProject((prev) => ({
      ...prev,
      [techType]: checked
        ? [...prev[techType], value]
        : prev[techType].filter((tech) => tech !== value),
    }));
  };

  const addTool = () => {
    if (!newTool.name || newTool.cost < 0) {
      setErrors({
        ...errors,
        newTool:
          "Tool name and cost must be provided and cost must be positive",
      });
      return;
    }

    setProject({
      ...project,
      tools: [
        ...project.tools,
        { name: newTool.name, cost: Number(newTool.cost) },
      ],
    });
    setNewTool({ name: "", cost: 1 });
    setErrors((prevErrors) => {
      const newErrors = { ...prevErrors };
      delete newErrors.newTool;
      return newErrors;
    });
  };

  const removeTool = (index) => {
    setProject({
      ...project,
      tools: project.tools.filter((_, i) => i !== index),
    });
    setErrors({ ...errors });
  };

  const calculateBudget = () => {
    if (Object.keys(errors).length > 0) {
      alert("Please fix the errors before calculating the budget.");
      return;
    }

    const frontendCost =
      project.frontendAmount * project.frontendDevs * project.frontendHours;
    const backendCost =
      project.backendAmount * project.backendDevs * project.backendHours;
    const designerCost =
      project.designerAmount * project.designerDevs * project.designerHours;
    const devopsCost =
      project.devopsAmount * project.devopsDevs * project.devopsHours;
    const cloudCost = project.cloudAmount;
    const toolCost = project.tools.reduce((sum, tool) => sum + tool.cost, 0);
    const baseTotal =
      frontendCost +
      backendCost +
      designerCost +
      devopsCost +
      cloudCost +
      toolCost;
    const bufferCost = (project.bufferPercentage / 100) * baseTotal;
    const miscCost = project.miscExpenses;
    const totalContingencyCost = bufferCost + miscCost;
    const total = baseTotal + totalContingencyCost;

    setResult({
      frontendCost,
      backendCost,
      designerCost,
      devopsCost,
      cloudCost,
      toolCost,
      bufferCost,
      miscCost,
      totalContingencyCost,
      total,
      currency: project.currency,
      timeUnit: project.timeUnit,
    });
  };

  const handleExportClick = () => {
    setIsModalOpen(true);
  };

  const confirmExport = () => {
    setIsModalOpen(false);
    exportPDF();
  };

  const exportPDF = () => {
    const doc = new jsPDF();
    const currencySymbol = project.currency === "Dollars" ? "$" : "₹";

    doc.setFont("times", "bold");
    doc.setTextColor(0, 51, 102);

    doc.setFontSize(22);
    doc.text("BUDGET ESTIMATION REPORT", 105, 20, { align: "center" });

    doc.setFontSize(12);
    doc.setTextColor(33, 33, 33);
    doc.setFont("times", "normal");
    doc.text(`Project Name: ${project.name || "Unnamed Project"}`, 20, 40);
    doc.text(`Prepared By: Makonis Software Solutions Pvt Ltd`, 20, 50);
    doc.text(`Date: ${new Date().toLocaleDateString("en-GB")}`, 20, 60);

    let currentY = 80;
    let sectionNumber = 1;
    doc.setFontSize(16);
    doc.setFont("times", "bold");
    doc.setTextColor(0, 51, 102);
    doc.text(`${sectionNumber}. PROJECT OVERVIEW`, 20, currentY);
    doc.setFontSize(12);
    doc.setFont("times", "normal");
    doc.setTextColor(33, 33, 33);

    const overviewFields = [];
    if (pdfOptions.overviewFields.projectType) {
      overviewFields.push(`Project Type: ${project.type || "Not specified"}`);
    }
    if (pdfOptions.overviewFields.duration) {
      overviewFields.push(`Duration: ${project.duration || "Not specified"}`);
    }
    if (pdfOptions.overviewFields.functional) {
      const splitFunctional = doc.splitTextToSize(
        `Functional Requirements: ${project.functional || "Not specified"}`,
        170
      );
      overviewFields.push(...splitFunctional);
    }
    if (pdfOptions.overviewFields.frontendTech) {
      overviewFields.push(
        `Frontend Tech: ${project.frontendTech.join(", ") || "None"}`
      );
    }
    if (pdfOptions.overviewFields.backendTech) {
      overviewFields.push(
        `Backend Tech: ${project.backendTech.join(", ") || "None"}`
      );
    }

    if (overviewFields.length > 0) {
      currentY += 15;
      overviewFields.forEach((line) => {
        doc.text(line, 20, currentY);
        currentY += 10;
      });
    } else {
      currentY += 15;
    }

    sectionNumber++;
    doc.setFontSize(16);
    doc.setFont("times", "bold");
    doc.setTextColor(0, 51, 102);
    doc.text(`${sectionNumber}. COST BREAKDOWN`, 20, currentY);
    currentY += 10;

    if (pdfOptions.tables.developmentCosts) {
      doc.setFontSize(12);
      doc.setFont("times", "normal");
      doc.setTextColor(33, 33, 33);
      const devBody = [
        [
          "Frontend Development",
          project.frontendDevs.toString(),
          project.frontendHours.toString(),
          `${currencySymbol}${
            project.frontendAmount ||
            (result &&
              (
                result.frontendCost /
                (project.frontendDevs * project.frontendHours)
              ).toFixed(2)) ||
            "0"
          }`,
          `${currencySymbol}${result ? result.frontendCost.toFixed(2) : "0"}`,
        ],
        [
          "Backend Development",
          project.backendDevs.toString(),
          project.backendHours.toString(),
          `${currencySymbol}${
            project.backendAmount ||
            (result &&
              (
                result.backendCost /
                (project.backendDevs * project.backendHours)
              ).toFixed(2)) ||
            "0"
          }`,
          `${currencySymbol}${result ? result.backendCost.toFixed(2) : "0"}`,
        ],
        [
          "UI/UX Design",
          project.designerDevs.toString(),
          project.designerHours.toString(),
          `${currencySymbol}${
            project.designerAmount ||
            (result &&
              (
                result.designerCost /
                (project.designerDevs * project.designerHours)
              ).toFixed(2)) ||
            "0"
          }`,
          `${currencySymbol}${result ? result.designerCost.toFixed(2) : "0"}`,
        ],
        [
          "DevOps",
          project.devopsDevs.toString(),
          project.devopsHours.toString(),
          `${currencySymbol}${
            project.devopsAmount ||
            (result &&
              (
                result.devopsCost /
                (project.devopsDevs * project.devopsHours)
              ).toFixed(2)) ||
            "0"
          }`,
          `${currencySymbol}${result ? result.devopsCost.toFixed(2) : "0"}`,
        ],
      ];
      autoTable(doc, {
        startY: currentY,
        head: [
          ["Item", "No of Resources", "Estimated Hours", "Hourly Rate", "Cost"],
        ],
        body: devBody,
        theme: "grid",
        styles: {
          fontSize: 10,
          cellPadding: 3,
          font: "times",
          textColor: [33, 33, 33],
        },
        headStyles: {
          fillColor: [65, 114, 159],
          textColor: [255, 255, 255],
          fontStyle: "bold",
        },
        columnStyles: {
          0: { cellWidth: 60 },
          1: { cellWidth: 30, halign: "center" },
          2: { cellWidth: 30, halign: "center" },
          3: { cellWidth: 30, halign: "right" },
          4: { cellWidth: 30, halign: "right" },
        },
      });
      currentY = doc.lastAutoTable.finalY + 15;
    } else {
      currentY += 10;
    }

    if (pdfOptions.tables.infrastructureCosts) {
      sectionNumber++;
      doc.setFontSize(16);
      doc.setFont("times", "bold");
      doc.setTextColor(0, 51, 102);
      doc.text(`${sectionNumber}. INFRASTRUCTURE COSTS`, 20, currentY);
      const infraBody = [
        [
          `Cloud Hosting (${project.cloud || "Not specified"})`,
          `${currencySymbol}${result ? result.cloudCost.toFixed(2) : "0"}`,
        ],
        ...project.tools.map((tool) => [
          tool.name,
          `${currencySymbol}${tool.cost.toFixed(2)}`,
        ]),
      ];
      autoTable(doc, {
        startY: currentY + 10,
        head: [["Item", "Estimated Cost"]],
        body: infraBody,
        theme: "grid",
        styles: {
          fontSize: 10,
          cellPadding: 3,
          font: "times",
          textColor: [33, 33, 33],
        },
        headStyles: {
          fillColor: [65, 114, 159],
          textColor: [255, 255, 255],
          fontStyle: "bold",
        },
        columnStyles: {
          0: { cellWidth: 120 },
          1: { cellWidth: 60, halign: "right" },
        },
      });
      currentY = doc.lastAutoTable.finalY + 15;
    }

    if (pdfOptions.tables.contingency) {
      sectionNumber++;
      doc.setFontSize(16);
      doc.setFont("times", "bold");
      doc.setTextColor(0, 51, 102);
      doc.text(`${sectionNumber}. CONTINGENCY & MISCELLANEOUS`, 20, currentY);
      const contingencyBody = [
        [
          `Buffer for Unexpected Costs (${project.bufferPercentage}%)`,
          `${currencySymbol}${result ? result.bufferCost.toFixed(2) : "0"}`,
        ],
        [
          "Miscellaneous Expenses",
          `${currencySymbol}${result ? result.miscCost.toFixed(2) : "0"}`,
        ],
        [
          "Total Contingency Cost",
          `${currencySymbol}${
            result ? result.totalContingencyCost.toFixed(2) : "0"
          }`,
        ],
      ];
      autoTable(doc, {
        startY: currentY + 10,
        head: [["Item", "Estimated Cost"]],
        body: contingencyBody,
        theme: "grid",
        styles: {
          fontSize: 10,
          cellPadding: 3,
          font: "times",
          textColor: [33, 33, 33],
        },
        headStyles: {
          fillColor: [65, 114, 159],
          textColor: [255, 255, 255],
          fontStyle: "bold",
        },
        columnStyles: {
          0: { cellWidth: 120 },
          1: { cellWidth: 60, halign: "right" },
        },
      });
      currentY = doc.lastAutoTable.finalY + 15;
    }

    if (pdfOptions.tables.overallBudget) {
      sectionNumber++;
      doc.setFontSize(16);
      doc.setFont("times", "bold");
      doc.setTextColor(0, 51, 102);
      doc.text(`${sectionNumber}. OVERALL ESTIMATED BUDGET`, 20, currentY);
      const totalBody = [
        [
          "Development Costs",
          `${currencySymbol}${
            result
              ? (
                  result.frontendCost +
                  result.backendCost +
                  result.designerCost +
                  result.devopsCost
                ).toFixed(2)
              : "0"
          }`,
        ],
        [
          "Infrastructure & Tools Costs",
          `${currencySymbol}${
            result ? (result.cloudCost + result.toolCost).toFixed(2) : "0"
          }`,
        ],
        [
          "Contingency Costs",
          `${currencySymbol}${
            result ? result.totalContingencyCost.toFixed(2) : "0"
          }`,
        ],
        [
          "Grand Total",
          `${currencySymbol}${result ? result.total.toFixed(2) : "0"}`,
        ],
      ];
      autoTable(doc, {
        startY: currentY + 10,
        head: [["Category", "Estimated Cost"]],
        body: totalBody,
        theme: "grid",
        styles: {
          fontSize: 10,
          cellPadding: 3,
          font: "times",
          textColor: [33, 33, 33],
        },
        headStyles: {
          fillColor: [65, 114, 159],
          textColor: [255, 255, 255],
          fontStyle: "bold",
        },
        columnStyles: {
          0: { cellWidth: 120 },
          1: { cellWidth: 60, halign: "right" },
        },
      });
      currentY = doc.lastAutoTable.finalY + 15;
    }

    if (pdfOptions.tables.paymentTerms) {
      sectionNumber++;
      doc.setFontSize(16);
      doc.setFont("times", "bold");
      doc.setTextColor(0, 51, 102);
      doc.text(`${sectionNumber}. PAYMENT TERMS`, 20, currentY);
      const paymentBody = [
        [
          "Project Kickoff",
          `${project.paymentTerms.kickoff}%`,
          `${currencySymbol}${
            result
              ? (result.total * (project.paymentTerms.kickoff / 100)).toFixed(2)
              : "0"
          }`,
        ],
        [
          "UI/UX Completion",
          `${project.paymentTerms.uiuxCompletion}%`,
          `${currencySymbol}${
            result
              ? (
                  result.total *
                  (project.paymentTerms.uiuxCompletion / 100)
                ).toFixed(2)
              : "0"
          }`,
        ],
        [
          "Backend Development",
          `${project.paymentTerms.backendDevelopment}%`,
          `${currencySymbol}${
            result
              ? (
                  result.total *
                  (project.paymentTerms.backendDevelopment / 100)
                ).toFixed(2)
              : "0"
          }`,
        ],
        [
          "Beta Testing",
          `${project.paymentTerms.betaTesting}%`,
          `${currencySymbol}${
            result
              ? (
                  result.total *
                  (project.paymentTerms.betaTesting / 100)
                ).toFixed(2)
              : "0"
          }`,
        ],
        [
          "Final Delivery",
          `${project.paymentTerms.finalDelivery}%`,
          `${currencySymbol}${
            result
              ? (
                  result.total *
                  (project.paymentTerms.finalDelivery / 100)
                ).toFixed(2)
              : "0"
          }`,
        ],
        [
          "Total",
          "100%",
          `${currencySymbol}${result ? result.total.toFixed(2) : "0"}`,
        ],
      ];
      autoTable(doc, {
        startY: currentY + 10,
        head: [["Milestone", "Percentage", "Amount"]],
        body: paymentBody,
        theme: "grid",
        styles: {
          fontSize: 10,
          cellPadding: 3,
          font: "times",
          textColor: [33, 33, 33],
        },
        headStyles: {
          fillColor: [65, 114, 159],
          textColor: [255, 255, 255],
          fontStyle: "bold",
        },
        columnStyles: {
          0: { cellWidth: 90 },
          1: { cellWidth: 30, halign: "center" },
          2: { cellWidth: 60, halign: "right" },
        },
      });
      currentY = doc.lastAutoTable.finalY + 15;
    }

    // doc.setFontSize(12);
    // doc.setFont("times", "bold");
    // doc.setTextColor(0, 51, 102);
    // doc.text("Approved By:", 20, currentY);
    // doc.setFont("times", "normal");
    // doc.setTextColor(33, 33, 33);
    // doc.text(
    //   ` ${doc.splitTextToSize(`Mahesh software engineer`, 20, currentY + 10)}`,
    //   20,
    //   currentY + 10
    // );

    doc.save(`${project.name || "Budget_Estimation"}.pdf`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-4xl">
        <h1 className="text-3xl font-bold mb-8 text-center text-indigo-800">
          Project Budget Estimator
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Left Column: Project Details */}
          <div className="space-y-8">
            <div>
              <label className="block text-lg font-medium text-gray-800">
                Project Name
              </label>
              <input
                type="text"
                name="name"
                value={project.name}
                onChange={handleChange}
                className="mt-2 block w-full p-4 border border-gray-300 rounded-lg text-gray-900 bg-white focus:ring-4 focus:ring-indigo-300 focus:border-transparent transition-all duration-200"
              />
            </div>

            <div>
              <label className="block text-lg font-medium text-gray-800">
                Duration
              </label>
              <input
                type="text"
                name="duration"
                value={project.duration}
                onChange={handleChange}
                placeholder="e.g., 2-3 months"
                className="mt-2 block w-full p-4 border border-gray-300 rounded-lg text-gray-900 bg-white focus:ring-4 focus:ring-indigo-300 focus:border-transparent transition-all duration-200"
              />
            </div>

            <div>
              <label className="block text-lg font-medium text-gray-800">
                Project Type
              </label>
              <select
                name="type"
                value={project.type}
                onChange={handlePresetChange}
                className="mt-2 block w-full p-4 border border-gray-300 rounded-lg text-gray-900 bg-white focus:ring-4 focus:ring-indigo-300 focus:border-transparent appearance-none"
              >
                <option value="" className="text-gray-500">
                  Select a preset
                </option>
                {Object.keys(presets).map((preset) => (
                  <option key={preset} value={preset} className="text-gray-900">
                    {preset}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-lg font-medium text-gray-800">
                Functional Requirements
              </label>
              <textarea
                name="functional"
                value={project.functional}
                onChange={handleChange}
                placeholder="e.g., budget estimation, PDF export"
                className="mt-2 block w-full p-4 border border-gray-300 rounded-lg text-gray-900 bg-white h-24 resize-none focus:ring-4 focus:ring-indigo-300 focus:border-transparent transition-all duration-200"
              />
            </div>

            <div className="border border-gray-900 p-4 rounded-lg">
              <label className="block text-lg font-medium text-gray-800">
                Cloud Usage
              </label>
              <div className="flex space-x-6">
                <div className="w-1/2">
                  <label className="block text-md text-gray-700">
                    Cloud technology
                  </label>
                  <input
                    type="text"
                    name="cloud"
                    value={project.cloud}
                    onChange={handleChange}
                    placeholder="e.g., Vercel, AWS"
                    className="block w-full p-4 border border-gray-300 rounded-lg text-gray-900 bg-white focus:ring-4 focus:ring-indigo-300 focus:border-transparent transition-all duration-200"
                  />
                </div>
                <div className="w-1/2">
                  <label className="block text-md text-gray-700">
                    Cost ({project.currency === "Dollars" ? "$" : "₹"})
                  </label>
                  <input
                    type="number"
                    name="cloudAmount"
                    value={project.cloudAmount}
                    onChange={handleChange}
                    min="0"
                    className="block w-full p-4 border border-gray-300 rounded-lg text-gray-900 bg-white focus:ring-4 focus:ring-indigo-300 focus:border-transparent transition-all duration-200"
                  />
                  {errors.cloudAmount && (
                    <p className="text-red-600 text-sm mt-1">
                      {errors.cloudAmount}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div>
              <label className="block text-lg font-medium text-gray-800">
                Currency
              </label>
              <select
                name="currency"
                value={project.currency}
                onChange={handleChange}
                className="mt-2 block w-full p-4 border border-gray-300 rounded-lg text-gray-900 bg-white focus:ring-4 focus:ring-indigo-300 focus:border-transparent appearance-none"
              >
                <option value="Dollars" className="text-gray-900">
                  $ (Dollars)
                </option>
                <option value="Rupees" className="text-gray-900">
                  ₹ (Rupees)
                </option>
              </select>
            </div>

            <div>
              <label className="block text-lg font-medium text-gray-800">
                Time Unit
              </label>
              <select
                name="timeUnit"
                value={project.timeUnit}
                onChange={handleChange}
                className="mt-2 block w-full p-4 border border-gray-300 rounded-lg text-gray-900 bg-white focus:ring-4 focus:ring-indigo-300 focus:border-transparent appearance-none"
              >
                <option value="Hourly" className="text-gray-900">
                  Hourly
                </option>
                <option value="Daily" className="text-gray-900">
                  Daily
                </option>
                <option value="Monthly" className="text-gray-900">
                  Monthly
                </option>
              </select>
            </div>

            <div className="border border-gray-900 p-4 rounded-lg">
              <label className="block text-lg font-medium text-gray-800">
                Frontend Technologies
              </label>
              <div className="mt-2 space-y-4">
                {frontendOptions.map((tech) => (
                  <label key={tech} className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      value={tech}
                      checked={project.frontendTech.includes(tech)}
                      onChange={handleTechChange("frontendTech")}
                      className="h-5 w-5 text-indigo-600 border-gray-300 rounded focus:ring-4 focus:ring-indigo-300 transition-all duration-200"
                    />
                    <span className="text-gray-900">{tech}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="border border-gray-900 p-4 rounded-lg">
              <label className="block text-lg font-medium text-gray-800">
                Backend Technologies
              </label>
              <div className="mt-2 space-y-4">
                {backendOptions.map((tech) => (
                  <label key={tech} className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      value={tech}
                      checked={project.backendTech.includes(tech)}
                      onChange={handleTechChange("backendTech")}
                      className="h-5 w-5 text-indigo-600 border-gray-300 rounded focus:ring-4 focus:ring-indigo-300 transition-all duration-200"
                    />
                    <span className="text-gray-900">{tech}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-8">
            <div className="border border-gray-900 p-4 rounded-lg">
              <label className="block text-lg font-medium text-gray-800">
                Frontend
              </label>
              <div className="mt-2 space-y-4">
                <div className="flex space-x-6">
                  <div className="w-1/4">
                    <label className="block text-md text-gray-700">
                      Amount ({project.currency === "Dollars" ? "$" : "₹"}/$
                      {project.timeUnit.toLowerCase()})
                    </label>
                    <input
                      type="number"
                      name="frontendAmount"
                      value={project.frontendAmount}
                      onChange={handleChange}
                      min="0"
                      className="block w-full p-4 border border-gray-300 rounded-lg text-gray-900 bg-white focus:ring-4 focus:ring-indigo-300 focus:border-transparent transition-all duration-200"
                    />
                    {errors.frontendAmount && (
                      <p className="text-red-600 text-sm mt-1">
                        {errors.frontendAmount}
                      </p>
                    )}
                  </div>
                  <div className="w-1/4">
                    <label className="block text-md text-gray-700">
                      No of Developers
                    </label>
                    <input
                      type="number"
                      name="frontendDevs"
                      value={project.frontendDevs}
                      onChange={handleChange}
                      min="1"
                      className="block w-full p-4 border border-gray-300 rounded-lg text-gray-900 bg-white focus:ring-4 focus:ring-indigo-300 focus:border-transparent transition-all duration-200"
                    />
                    {errors.frontendDevs && (
                      <p className="text-red-600 text-sm mt-1">
                        {errors.frontendDevs}
                      </p>
                    )}
                  </div>
                  <div className="w-1/4">
                    <label className="block text-md text-gray-700">
                      Total No Hours
                    </label>
                    <input
                      type="number"
                      name="frontendHours"
                      value={project.frontendHours}
                      onChange={handleChange}
                      min="0"
                      className="block w-full p-4 border border-gray-300 rounded-lg text-gray-900 bg-white focus:ring-4 focus:ring-indigo-300 focus:border-transparent transition-all duration-200"
                    />
                    {errors.frontendHours && (
                      <p className="text-red-600 text-sm mt-1">
                        {errors.frontendHours}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="border border-gray-900 p-4 rounded-lg">
              <label className="block text-lg font-medium text-gray-800">
                Backend
              </label>
              <div className="mt-2 space-y-4">
                <div className="flex space-x-6">
                  <div className="w-1/4">
                    <label className="block text-md text-gray-700">
                      Amount ({project.currency === "Dollars" ? "$" : "₹"}/$
                      {project.timeUnit.toLowerCase()})
                    </label>
                    <input
                      type="number"
                      name="backendAmount"
                      value={project.backendAmount}
                      onChange={handleChange}
                      min="0"
                      className="block w-full p-4 border border-gray-300 rounded-lg text-gray-900 bg-white focus:ring-4 focus:ring-indigo-300 focus:border-transparent transition-all duration-200"
                    />
                    {errors.backendAmount && (
                      <p className="text-red-600 text-sm mt-1">
                        {errors.backendAmount}
                      </p>
                    )}
                  </div>
                  <div className="w-1/4">
                    <label className="block text-md text-gray-700">
                      No of Developers
                    </label>
                    <input
                      type="number"
                      name="backendDevs"
                      value={project.backendDevs}
                      onChange={handleChange}
                      min="1"
                      className="block w-full p-4 border border-gray-300 rounded-lg text-gray-900 bg-white focus:ring-4 focus:ring-indigo-300 focus:border-transparent transition-all duration-200"
                    />
                    {errors.backendDevs && (
                      <p className="text-red-600 text-sm mt-1">
                        {errors.backendDevs}
                      </p>
                    )}
                  </div>
                  <div className="w-1/4">
                    <label className="block text-md text-gray-700">
                      Total No Hours
                    </label>
                    <input
                      type="number"
                      name="backendHours"
                      value={project.backendHours}
                      onChange={handleChange}
                      min="0"
                      className="block w-full p-4 border border-gray-300 rounded-lg text-gray-900 bg-white focus:ring-4 focus:ring-indigo-300 focus:border-transparent transition-all duration-200"
                    />
                    {errors.backendHours && (
                      <p className="text-red-600 text-sm mt-1">
                        {errors.backendHours}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="border border-gray-900 p-4 rounded-lg">
              <label className="block text-lg font-medium text-gray-800">
                Designer
              </label>
              <div className="mt-2 space-y-4">
                <div className="flex space-x-6">
                  <div className="w-1/4">
                    <label className="block text-md text-gray-700">
                      Amount ({project.currency === "Dollars" ? "$" : "₹"}/$
                      {project.timeUnit.toLowerCase()})
                    </label>
                    <input
                      type="number"
                      name="designerAmount"
                      value={project.designerAmount}
                      onChange={handleChange}
                      min="0"
                      className="block w-full p-4 border border-gray-300 rounded-lg text-gray-900 bg-white focus:ring-4 focus:ring-indigo-300 focus:border-transparent transition-all duration-200"
                    />
                    {errors.designerAmount && (
                      <p className="text-red-600 text-sm mt-1">
                        {errors.designerAmount}
                      </p>
                    )}
                  </div>
                  <div className="w-1/4">
                    <label className="block text-md text-gray-700">
                      No of Designers
                    </label>
                    <input
                      type="number"
                      name="designerDevs"
                      value={project.designerDevs}
                      onChange={handleChange}
                      min="1"
                      className="block w-full p-4 border border-gray-300 rounded-lg text-gray-900 bg-white focus:ring-4 focus:ring-indigo-300 focus:border-transparent transition-all duration-200"
                    />
                    {errors.designerDevs && (
                      <p className="text-red-600 text-sm mt-1">
                        {errors.designerDevs}
                      </p>
                    )}
                  </div>
                  <div className="w-1/4">
                    <label className="block text-md text-gray-700">
                      Total No Hours
                    </label>
                    <input
                      type="number"
                      name="designerHours"
                      value={project.designerHours}
                      onChange={handleChange}
                      min="0"
                      className="block w-full p-4 border border-gray-300 rounded-lg text-gray-900 bg-white focus:ring-4 focus:ring-indigo-300 focus:border-transparent transition-all duration-200"
                    />
                    {errors.designerHours && (
                      <p className="text-red-600 text-sm mt-1">
                        {errors.designerHours}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="border border-gray-900 p-4 rounded-lg">
              <label className="block text-lg font-medium text-gray-800">
                DevOps
              </label>
              <div className="mt-2 space-y-4">
                <div className="flex space-x-6">
                  <div className="w-1/4">
                    <label className="block text-md text-gray-700">
                      Amount ({project.currency === "Dollars" ? "$" : "₹"}/$
                      {project.timeUnit.toLowerCase()})
                    </label>
                    <input
                      type="number"
                      name="devopsAmount"
                      value={project.devopsAmount}
                      onChange={handleChange}
                      min="0"
                      className="block w-full p-4 border border-gray-300 rounded-lg text-gray-900 bg-white focus:ring-4 focus:ring-indigo-300 focus:border-transparent transition-all duration-200"
                    />
                    {errors.devopsAmount && (
                      <p className="text-red-600 text-sm mt-1">
                        {errors.devopsAmount}
                      </p>
                    )}
                  </div>
                  <div className="w-1/4">
                    <label className="block text-md text-gray-700">
                      No of Engineers
                    </label>
                    <input
                      type="number"
                      name="devopsDevs"
                      value={project.devopsDevs}
                      onChange={handleChange}
                      min="1"
                      className="block w-full p-4 border border-gray-300 rounded-lg text-gray-900 bg-white focus:ring-4 focus:ring-indigo-300 focus:border-transparent transition-all duration-200"
                    />
                    {errors.devopsDevs && (
                      <p className="text-red-600 text-sm mt-1">
                        {errors.devopsDevs}
                      </p>
                    )}
                  </div>
                  <div className="w-1/4">
                    <label className="block text-md text-gray-700">
                      Total No Hours
                    </label>
                    <input
                      type="number"
                      name="devopsHours"
                      value={project.devopsHours}
                      onChange={handleChange}
                      min="0"
                      className="block w-full p-4 border border-gray-300 rounded-lg text-gray-900 bg-white focus:ring-4 focus:ring-indigo-300 focus:border-transparent transition-all duration-200"
                    />
                    {errors.devopsHours && (
                      <p className="text-red-600 text-sm mt-1">
                        {errors.devopsHours}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium text-gray-800">Tools</h3>
              <div className="space-y-6 mt-6">
                {project.tools.map((tool, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between bg-gray-100 p-4 rounded-lg"
                  >
                    <span className="text-gray-900 font-medium">
                      {tool.name}: ${tool.cost}
                    </span>
                    <button
                      onClick={() => removeTool(index)}
                      className="text-red-600 hover:text-red-800 px-3 py-2 rounded-md bg-red-100 hover:bg-red-200 transition-all duration-200"
                    >
                      Remove
                    </button>
                  </div>
                ))}
                <div className="flex space-x-6 items-center">
                  <input
                    type="text"
                    placeholder="Tool Name"
                    value={newTool.name}
                    onChange={(e) =>
                      setNewTool({ ...newTool, name: e.target.value })
                    }
                    className="block w-1/3 p-4 border border-gray-300 rounded-lg text-gray-900 bg-white focus:ring-4 focus:ring-indigo-300 focus:border-transparent transition-all duration-200"
                  />
                  <input
                    type="number"
                    placeholder="Cost"
                    value={newTool.cost}
                    onChange={(e) =>
                      setNewTool({
                        ...newTool,
                        cost: Math.max(0, Number(e.target.value)),
                      })
                    }
                    min="0"
                    className="block w-1/3 p-4 border border-gray-300 rounded-lg text-gray-900 bg-white focus:ring-4 focus:ring-indigo-300 focus:border-transparent transition-all duration-200"
                  />
                  <button
                    onClick={addTool}
                    className="bg-teal-600 text-white px-6 py-3 rounded-lg hover:bg-teal-700 focus:ring-4 focus:ring-teal-300 focus:ring-offset-2 transition-all duration-200"
                  >
                    Add
                  </button>
                </div>
                {errors.newTool && (
                  <p className="text-red-600 text-sm mt-2">{errors.newTool}</p>
                )}
              </div>
            </div>

            <div className="border border-gray-900 p-4 rounded-lg">
              <h3 className="text-lg font-medium text-gray-800">
                Contingency & Miscellaneous
              </h3>
              <div className="mt-2 space-y-4">
                <div className="flex space-x-6">
                  <div className="w-1/2">
                    <label className="block text-md text-gray-700">
                      Buffer for Unexpected Costs (%)
                    </label>
                    <input
                      type="number"
                      name="bufferPercentage"
                      value={project.bufferPercentage}
                      onChange={handleChange}
                      min="0"
                      max="100"
                      className="block w-full p-4 border border-gray-300 rounded-lg text-gray-900 bg-white focus:ring-4 focus:ring-indigo-300 focus:border-transparent transition-all duration-200"
                    />
                    {errors.bufferPercentage && (
                      <p className="text-red-600 text-sm mt-1">
                        {errors.bufferPercentage}
                      </p>
                    )}
                  </div>
                  <div className="w-1/2">
                    <label className="block text-md text-gray-700">
                      Miscellaneous Expenses (
                      {project.currency === "Dollars" ? "$" : "₹"})
                    </label>
                    <input
                      type="number"
                      name="miscExpenses"
                      value={project.miscExpenses}
                      onChange={handleChange}
                      min="0"
                      className="block w-full p-4 border border-gray-300 rounded-lg text-gray-900 bg-white focus:ring-4 focus:ring-indigo-300 focus:border-transparent transition-all duration-200"
                    />
                    {errors.miscExpenses && (
                      <p className="text-red-600 text-sm mt-1">
                        {errors.miscExpenses}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="border border-gray-900 p-2 rounded-lg">
              <h3 className="text-lg font-medium text-gray-800">
                Payment Terms
              </h3>
              <div className="mt-.5 space-y-.5">
                {[
                  { label: "Project Kickoff", key: "kickoff" },
                  { label: "UI/UX Completion", key: "uiuxCompletion" },
                  { label: "Backend Development", key: "backendDevelopment" },
                  { label: "Beta Testing", key: "betaTesting" },
                  { label: "Final Delivery", key: "finalDelivery" },
                ].map((term) => (
                  <div key={term.key} className="flex space-x-6">
                    <div className="w-2/3">
                      <label className="block text-md text-gray-700">
                        {term.label}
                      </label>
                    </div>
                    <div className="w-1/3">
                      <input
                        type="number"
                        name={`payment_${term.key}`}
                        value={project.paymentTerms[term.key]}
                        onChange={handleChange}
                        min="0"
                        max="100"
                        className="block w-full p-4 border border-gray-300 rounded-lg text-gray-900 bg-white focus:ring-4 focus:ring-indigo-300 focus:border-transparent transition-all duration-200"
                      />
                      {errors[`payment_${term.key}`] && (
                        <p className="text-red-600 text-sm mt-1">
                          {errors[`payment_${term.key}`]}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
                {errors.paymentTotal && (
                  <p className="text-red-600 text-sm mt-2">
                    {errors.paymentTotal}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
        <div className="flex justify-center p-4">
          <button
            onClick={calculateBudget}
            disabled={Object.keys(errors).length > 0}
            className={`w-full max-w-xs p-4 rounded-lg text-white font-medium ${
              Object.keys(errors).length > 0
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-gradient-to-b from-blue-800 to-blue-600 hover:bg-gradient-to-b hover:from-blue-700 hover:to-blue-500"
            }`}
          >
            Calculate Budget
          </button>
        </div>

        {result && (
          <div className="mt-8 p-6 bg-gray-100 rounded-xl shadow-md">
            <h2 className="text-2xl font-bold mb-6 text-indigo-800">
              Budget Breakdown
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <p className="text-gray-900">
                Project Name: {project.name || "Unnamed Project"}
              </p>
              <p className="text-gray-900">
                Duration: {project.duration || "Not specified"}
              </p>
              <p className="text-gray-900">Project Type: {project.type}</p>
              <p className="text-gray-900">
                Functional Requirements: {project.functional || "Not specified"}
              </p>
              <p className="text-gray-900">
                Cloud Usage: {project.cloud || "Not specified"} (
                {project.currency === "Dollars" ? "$" : "₹"}$
                {result.cloudCost.toFixed(2)})
              </p>
              <p className="text-gray-900">
                Currency: {project.currency} (
                {project.currency === "Dollars" ? "$" : "₹"})
              </p>
              <p className="text-gray-900">Time Unit: {project.timeUnit}</p>
              <p className="text-gray-900">
                Frontend Tech: {project.frontendTech.join(", ") || "None"}
              </p>
              <p className="text-gray-900">
                Backend Tech: {project.backendTech.join(", ") || "None"}
              </p>
              <p className="text-gray-900">
                Frontend ({project.frontendDevs} devs, {project.frontendHours}{" "}
                hrs): {project.currency === "Dollars" ? "$" : "₹"}$
                {project.frontendAmount ||
                  (
                    result.frontendCost /
                    (project.frontendDevs * project.frontendHours)
                  ).toFixed(2)}
                /{project.timeUnit.toLowerCase()} (Total:{" "}
                {project.currency === "Dollars" ? "$" : "₹"}$
                {result.frontendCost.toFixed(2)}/
                {project.timeUnit.toLowerCase()})
              </p>
              <p className="text-gray-900">
                Backend ({project.backendDevs} devs, {project.backendHours}{" "}
                hrs): {project.currency === "Dollars" ? "$" : "₹"}$
                {project.backendAmount ||
                  (
                    result.backendCost /
                    (project.backendDevs * project.backendHours)
                  ).toFixed(2)}
                /{project.timeUnit.toLowerCase()} (Total:{" "}
                {project.currency === "Dollars" ? "$" : "₹"}$
                {result.backendCost.toFixed(2)}/{project.timeUnit.toLowerCase()}
                )
              </p>
              <p className="text-gray-900">
                Designer ({project.designerDevs} devs, {project.designerHours}{" "}
                hrs): {project.currency === "Dollars" ? "$" : "₹"}$
                {project.designerAmount ||
                  (
                    result.designerCost /
                    (project.designerDevs * project.designerHours)
                  ).toFixed(2)}
                /{project.timeUnit.toLowerCase()} (Total:{" "}
                {project.currency === "Dollars" ? "$" : "₹"}$
                {result.designerCost.toFixed(2)}/
                {project.timeUnit.toLowerCase()})
              </p>
              <p className="text-gray-900">
                DevOps Engineer ({project.devopsDevs} devs,{" "}
                {project.devopsHours} hrs):{" "}
                {project.currency === "Dollars" ? "$" : "₹"}$
                {project.devopsAmount ||
                  (
                    result.devopsCost /
                    (project.devopsDevs * project.devopsHours)
                  ).toFixed(2)}
                /{project.timeUnit.toLowerCase()} (Total:{" "}
                {project.currency === "Dollars" ? "$" : "₹"}$
                {result.devopsCost.toFixed(2)}/{project.timeUnit.toLowerCase()})
              </p>
              <p className="text-gray-900">
                Tools: {project.currency === "Dollars" ? "$" : "₹"}$
                {result.toolCost.toFixed(2)}
              </p>
              <p className="text-gray-900">
                Buffer Cost ({project.bufferPercentage}%):{" "}
                {project.currency === "Dollars" ? "$" : "₹"}$
                {result.bufferCost.toFixed(2)}
              </p>
              <p className="text-gray-900">
                Miscellaneous Expenses:{" "}
                {project.currency === "Dollars" ? "$" : "₹"}$
                {result.miscCost.toFixed(2)}
              </p>
              <p className="text-gray-900">
                Total Contingency Cost:{" "}
                {project.currency === "Dollars" ? "$" : "₹"}$
                {result.totalContingencyCost.toFixed(2)}
              </p>
              <p className="text-gray-900">
                Payment Terms:
                <ul className="list-disc list-inside">
                  <li>
                    Kickoff ({project.paymentTerms.kickoff}%):{" "}
                    {project.currency === "Dollars" ? "$" : "₹"}$
                    {(
                      result.total *
                      (project.paymentTerms.kickoff / 100)
                    ).toFixed(2)}
                  </li>
                  <li>
                    UI/UX ({project.paymentTerms.uiuxCompletion}%):{" "}
                    {project.currency === "Dollars" ? "$" : "₹"}$
                    {(
                      result.total *
                      (project.paymentTerms.uiuxCompletion / 100)
                    ).toFixed(2)}
                  </li>
                  <li>
                    Backend ({project.paymentTerms.backendDevelopment}%):{" "}
                    {project.currency === "Dollars" ? "$" : "₹"}$
                    {(
                      result.total *
                      (project.paymentTerms.backendDevelopment / 100)
                    ).toFixed(2)}
                  </li>
                  <li>
                    Beta Testing ({project.paymentTerms.betaTesting}%):{" "}
                    {project.currency === "Dollars" ? "$" : "₹"}$
                    {(
                      result.total *
                      (project.paymentTerms.betaTesting / 100)
                    ).toFixed(2)}
                  </li>
                  <li>
                    Final Delivery ({project.paymentTerms.finalDelivery}%):{" "}
                    {project.currency === "Dollars" ? "$" : "₹"}$
                    {(
                      result.total *
                      (project.paymentTerms.finalDelivery / 100)
                    ).toFixed(2)}
                  </li>
                </ul>
              </p>
            </div>
            <p className="text-2xl font-bold mt-6 text-indigo-800">
              Total: {project.currency === "Dollars" ? "$" : "₹"}$
              {result.total.toFixed(2)}
            </p>
            <button
              onClick={handleExportClick}
              className="mt-6 w-full p-4 bg-teal-600 text-white rounded-lg hover:bg-teal-700 focus:ring-4 focus:ring-teal-300 focus:ring-offset-2 transition-all duration-200"
            >
              Export as PDF
            </button>
          </div>
        )}

        {Object.keys(errors).length > 0 && (
          <div className="mt-6 p-4 bg-red-100 rounded-xl">
            <h3 className="text-lg font-medium text-red-800">
              Please fix the following errors:
            </h3>
            <ul className="list-disc list-inside text-red-600 mt-2">
              {Object.values(errors).map((error, index) => (
                <li key={index} className="text-sm">
                  {error}
                </li>
              ))}
            </ul>
          </div>
        )}

        {isModalOpen && (
          <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-8 w-full max-w-md shadow-2xl border border-indigo-200">
              <h2 className="text-2xl font-bold mb-6 text-indigo-900 tracking-wide">
                Customize PDF Export
              </h2>
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">
                    Project Overview Fields
                  </h3>
                  <div className="space-y-3">
                    {Object.entries(pdfOptions.overviewFields).map(
                      ([key, value]) => (
                        <label
                          key={key}
                          className="flex items-center space-x-3"
                        >
                          <input
                            type="checkbox"
                            checked={value}
                            onChange={(e) =>
                              setPdfOptions({
                                ...pdfOptions,
                                overviewFields: {
                                  ...pdfOptions.overviewFields,
                                  [key]: e.target.checked,
                                },
                              })
                            }
                            className="h-5 w-5 text-indigo-600 border-gray-300 rounded focus:ring-2 focus:ring-indigo-500 transition duration-200"
                          />
                          <span className="text-gray-700 font-medium">
                            {key
                              .replace(/([A-Z])/g, " $1")
                              .replace(/^./, (str) => str.toUpperCase())}
                          </span>
                        </label>
                      )
                    )}
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">
                    Tables
                  </h3>
                  <div className="space-y-3">
                    {Object.entries(pdfOptions.tables).map(([key, value]) => (
                      <label key={key} className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          checked={value}
                          onChange={(e) =>
                            setPdfOptions({
                              ...pdfOptions,
                              tables: {
                                ...pdfOptions.tables,
                                [key]: e.target.checked,
                              },
                            })
                          }
                          className="h-5 w-5 text-indigo-600 border-gray-300 rounded focus:ring-2 focus:ring-indigo-500 transition duration-200"
                        />
                        <span className="text-gray-700 font-medium">
                          {key
                            .replace(/([A-Z])/g, " $1")
                            .replace(/^./, (str) => str.toUpperCase())}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
              <div className="mt-8 flex justify-end space-x-4">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 focus:ring-2 focus:ring-gray-400 transition-all duration-200 font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmExport}
                  className="px-5 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 transition-all duration-200 font-medium"
                >
                  Export PDF
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
