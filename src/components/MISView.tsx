import React, { useState, useEffect, useMemo } from 'react';
import { api } from '../services/api';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import Icon from './Icon';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import SearchableSelect from './SearchableSelect';

interface MISViewProps {
  id: string;
  globalZone?: string;
}

// Robust lookup parser for any minor naming mismatches in the raw Google Sheets or offline DB
const getNormalizedRecord = (r: any) => {
  const findVal = (keys: string[]) => {
    for (const k of keys) {
      if (r[k] !== undefined && r[k] !== null) return r[k];
    }
    return null;
  };

  const passVal = Number(findVal(['passQty', 'pass', 'PASS', 'passquantity', 'passedQty']) || 0);
  const reworkVal = Number(findVal(['reworkQty', 'rework', 'REWORK', 'reworkQuantity']) || 0);
  const failVal = Number(findVal(['failQty', 'fail', 'FAIL', 'failquantity', 'rejectedQuantity', 'failedpieces']) || 0);
  const checkedVal = Number(findVal(['checkedQty', 'checked', 'CHECKED', 'checkedquantity', 'totalChecked', 'pcsChecked']) || (passVal + reworkVal + failVal));
  const rawDate = findVal(['checkingDate', 'checkingdate', 'date', 'DATE', 'timestamp']);
  
  let dateStr = '';
  if (rawDate) {
    try {
      const d = new Date(rawDate);
      if (!isNaN(d.getTime())) {
        dateStr = d.toISOString().split('T')[0];
      }
    } catch (e) {}
  }

  return {
    unit: String(findVal(['unit', 'UNIT', 'unitName']) || 'UNIT A').trim().toUpperCase(),
    style: String(findVal(['style', 'STYLE', 'styleName', 'wo', 'workorderNumber', 'styleRef']) || 'UNKNOWN STYLE').trim().toUpperCase(),
    size: String(findVal(['size', 'SIZE', 'sizeName']) || 'N/A').trim().toUpperCase(),
    cupsize: String(findVal(['cupsize', 'CUPSIZE', 'cupSize']) || '').trim().toUpperCase(),
    checked: checkedVal,
    pass: passVal,
    rework: reworkVal,
    fail: failVal,
    date: dateStr,
    zone: String(findVal(['zone', 'ZONE', 'location']) || '').trim().toUpperCase()
  };
};

const MISView: React.FC<MISViewProps> = ({ id, globalZone }) => {
  const [rawRecords, setRawRecords] = useState<any[]>([]);
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // States for Daily Report (C1) filtering
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedUnits, setSelectedUnits] = useState<string[]>(['UNIT A', 'UNIT B', 'UNIT C', 'UNIT D']);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedWorker, setSelectedWorker] = useState<string>('');
  const [selectedWorkorderId, setSelectedWorkorderId] = useState<string>('');
  const [workorderSearchInput, setWorkorderSearchInput] = useState<string>('');
  const [selectedUnitC5, setSelectedUnitC5] = useState<string>('UNIT A');
  const [selectedDateC5, setSelectedDateC5] = useState<string>('ALL');

  // Combined data storage for submodule quality analysis (A1 - A6)
  const [allSubmodulesData, setAllSubmodulesData] = useState<{
    material: any[];
    cutting: any[];
    inline: any[];
    endline: any[];
    aql: any[];
    finalAudit: any[];
    workorders?: any[];
  } | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (id === 'C3' || id === 'C4' || id === 'C6' || id === 'C5') {
        const [
          material,
          cutting,
          inline,
          endline,
          aql,
          finalAudit,
          workorders
        ] = await Promise.all([
          api.run('api_getMaterialData').catch(() => []),
          api.run('api_getCuttingData').catch(() => []),
          api.run('api_getInlineData').catch(() => []),
          api.run('api_getEndlineData').catch(() => []),
          api.run('api_getAQLData').catch(() => []),
          api.run('api_getFinalAuditData').catch(() => []),
          api.run('api_getWorkorders').catch(() => [])
        ]);

        setAllSubmodulesData({
          material: Array.isArray(material) ? material : [],
          cutting: Array.isArray(cutting) ? cutting : [],
          inline: Array.isArray(inline) ? inline : [],
          endline: Array.isArray(endline) ? endline : [],
          aql: Array.isArray(aql) ? aql : [],
          finalAudit: Array.isArray(finalAudit) ? finalAudit : [],
          workorders: Array.isArray(workorders) ? workorders : []
        });

        // Seed rawRecords with endline data so existing listeners don't break
        setRawRecords(Array.isArray(endline) ? endline : []);
      } else {
        const apiMapping: { [key: string]: string } = {
          'C1': 'api_getEndlineData',
          'C2': 'api_getEndlineData',
          'C4': 'api_getEndlineData',
          'C8': 'api_getMaterialData',
        };
        
        const targetApi = apiMapping[id] || 'api_getEndlineData';
        const res = await api.run(targetApi as any);

        if (res && res.length > 0) {
          setRawRecords(res);

          // Apply Global Zone Filter
          const filtered = globalZone && globalZone !== 'ALL' 
            ? res.filter((r: any) => (r.zone === globalZone || r.location === globalZone))
            : res;

          const grouped = filtered.reduce((acc: any, curr: any) => {
            const rawDate = curr.timestamp || curr.receivedDate;
            const date = new Date(rawDate).toLocaleDateString('en-US', { weekday: 'short' });
            if (!acc[date]) acc[date] = { name: date, pass: 0, rework: 0, fail: 0, total: 0 };
            
            const p = Number(curr.passQty || curr.passQuantity || 0);
            const r = Number(curr.reworkQty || 0);
            const f = Number(curr.failQty || curr.rejectedQuantity || 0);
            
            acc[date].pass += p;
            acc[date].rework += r;
            acc[date].fail += f;
            acc[date].total += (p + r + f);
            return acc;
          }, {});
          setData(Object.values(grouped));
        } else {
          setRawRecords([]);
          setData([
            { name: 'Mon', pass: 400, rework: 20, fail: 24 },
            { name: 'Tue', pass: 300, rework: 15, fail: 13 },
            { name: 'Wed', pass: 200, rework: 40, fail: 98 },
            { name: 'Thu', pass: 278, rework: 10, fail: 39 },
            { name: 'Fri', pass: 189, rework: 25, fail: 48 },
            { name: 'Sat', pass: 239, rework: 30, fill: 38 },
          ]);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id, globalZone]);

  // Extract dynamic helper sets for the Daily Report dashboard filters
  const availableDates = useMemo(() => {
    const dates = new Set<string>();
    if ((id === 'C3' || id === 'C4' || id === 'C6' || id === 'C5') && allSubmodulesData) {
      const processItem = (item: any) => {
        const rawDate = item.timestamp || item.receivedDate || item.checkingDate || item.date;
        if (rawDate) {
          try {
            const d = new Date(rawDate);
            if (!isNaN(d.getTime())) {
              dates.add(d.toISOString().split('T')[0]);
            }
          } catch (e) {}
        }
      };
      
      allSubmodulesData.material.forEach(processItem);
      allSubmodulesData.cutting.forEach(processItem);
      allSubmodulesData.inline.forEach(processItem);
      allSubmodulesData.endline.forEach(processItem);
      allSubmodulesData.aql.forEach(processItem);
      allSubmodulesData.finalAudit.forEach(processItem);
    } else {
      rawRecords.forEach(r => {
        const norm = getNormalizedRecord(r);
        if (norm.date) dates.add(norm.date);
      });
    }
    return Array.from(dates).sort((a, b) => b.localeCompare(a));
  }, [id, rawRecords, allSubmodulesData]);

  const availableUnits = useMemo(() => {
    const units = new Set<string>(['UNIT A', 'UNIT B', 'UNIT C', 'UNIT D']);
    rawRecords.forEach(r => {
      const norm = getNormalizedRecord(r);
      if (norm.unit) {
        units.add(norm.unit);
      }
    });
    return Array.from(units).filter(Boolean).sort();
  }, [rawRecords]);

  // Synchronize selectedDate on initial raw records load
  useEffect(() => {
    if (availableDates.length > 0) {
      setSelectedDate(prev => {
        if (!prev) return availableDates[0];
        return prev;
      });
    } else {
      setSelectedDate(prev => {
        if (!prev) return new Date().toISOString().split('T')[0];
        return prev;
      });
    }
  }, [availableDates]);

  // Select all dynamic units when they load
  useEffect(() => {
    if (availableUnits.length > 0) {
      setSelectedUnits(prev => {
        if (prev.length === 4 && prev.includes('UNIT A') && prev.includes('UNIT D')) {
          return availableUnits;
        }
        return prev;
      });
    }
  }, [availableUnits]);

  // Compute Style-wise aggregation for Daily Report (C1)
  const styleWiseData = useMemo(() => {
    const styleGroups: { [styleName: string]: { styleCode: string; pass: number; rework: number; fail: number; total: number; units: Set<string> } } = {};

    rawRecords.forEach(r => {
      const norm = getNormalizedRecord(r);
      
      // Filter by global zone
      if (globalZone && globalZone !== 'ALL') {
        if (norm.zone !== globalZone.toUpperCase()) return;
      }
      
      // Filter by selected units
      if (selectedUnits.length > 0) {
        if (!selectedUnits.includes(norm.unit)) return;
      }

      // Filter by selected date
      if (selectedDate && norm.date !== selectedDate) {
        return;
      }

      // Filter by search query
      if (searchQuery.trim() && !norm.style.includes(searchQuery.trim().toUpperCase())) {
        return;
      }

      const styleKey = norm.style || 'UNKNOWN STYLE';
      if (!styleGroups[styleKey]) {
        styleGroups[styleKey] = {
          styleCode: styleKey,
          pass: 0,
          rework: 0,
          fail: 0,
          total: 0,
          units: new Set<string>()
        };
      }

      styleGroups[styleKey].pass += norm.pass;
      styleGroups[styleKey].rework += norm.rework;
      styleGroups[styleKey].fail += norm.fail;
      styleGroups[styleKey].total += norm.checked;
      if (norm.unit) {
        styleGroups[styleKey].units.add(norm.unit);
      }
    });

    return Object.values(styleGroups).map(g => ({
      ...g,
      unitsList: Array.from(g.units).join(', ') || 'N/A',
      passPercent: g.total > 0 ? ((g.pass / g.total) * 100).toFixed(1) : '0.0',
      reworkPercent: g.total > 0 ? ((g.rework / g.total) * 100).toFixed(1) : '0.0',
      failPercent: g.total > 0 ? ((g.fail / g.total) * 100).toFixed(1) : '0.0',
    })).sort((a, b) => b.total - a.total); // Sorted by highest production volume first
  }, [rawRecords, globalZone, selectedUnits, selectedDate, searchQuery]);

  // Totals block summary for Daily Report KPI widgets
  const dReportSummary = useMemo(() => {
    let totalPass = 0;
    let totalRework = 0;
    let totalFail = 0;
    let totalChecked = 0;

    styleWiseData.forEach(s => {
      totalPass += s.pass;
      totalRework += s.rework;
      totalFail += s.fail;
      totalChecked += s.total;
    });

    const passRate = totalChecked > 0 ? ((totalPass / totalChecked) * 100).toFixed(1) : '0.0';
    return { totalPass, totalRework, totalFail, totalChecked, passRate };
  }, [styleWiseData]);

  // Overall General Stats for fallback charts (C2-C8)
  const summary = useMemo(() => {
    const totalPass = data.reduce((acc, curr) => acc + curr.pass, 0);
    const totalRework = data.reduce((acc, curr) => acc + (curr.rework || 0), 0);
    const totalFail = data.reduce((acc, curr) => acc + curr.fail, 0);
    const total = totalPass + totalRework + totalFail;
    const avgEff = total > 0 ? ((totalPass / total) * 100).toFixed(1) : 0;
    return { totalPass, totalRework, totalFail, avgEff };
  }, [data]);

  // Collapsible toggle states for C2 (Production Summary)
  const [expandedZones, setExpandedZones] = useState<Record<string, boolean>>({});
  const [expandedUnits, setExpandedUnits] = useState<Record<string, boolean>>({});

  // Compute Zone-wise & Unit-wise Style Production Summary (C2)
  interface StyleSummary {
    styleCode: string;
    pass: number;
    rework: number;
    fail: number;
    total: number;
    passPercent: string;
    reworkPercent: string;
    failPercent: string;
  }

  interface UnitSummary {
    unitName: string;
    pass: number;
    rework: number;
    fail: number;
    total: number;
    styles: StyleSummary[];
    passPercent: string;
  }

  interface ZoneSummary {
    zoneName: string;
    pass: number;
    rework: number;
    fail: number;
    total: number;
    units: UnitSummary[];
    passPercent: string;
  }

  const productionSummaryData = useMemo(() => {
    const zonesMap: Record<string, {
      zoneName: string;
      pass: number;
      rework: number;
      fail: number;
      total: number;
      units: Record<string, {
        unitName: string;
        pass: number;
        rework: number;
        fail: number;
        total: number;
        styles: Record<string, {
          styleCode: string;
          pass: number;
          rework: number;
          fail: number;
          total: number;
        }>;
      }>;
    }> = {};

    rawRecords.forEach(r => {
      const norm = getNormalizedRecord(r);

      // Filter by global zone
      if (globalZone && globalZone !== 'ALL') {
        if (norm.zone !== globalZone.toUpperCase()) return;
      }

      // Filter by selected date (shared state filter)
      if (selectedDate && norm.date !== selectedDate) return;

      // Filter by searchQuery (style search)
      if (searchQuery.trim() && !norm.style.includes(searchQuery.trim().toUpperCase())) return;

      const zoneKey = norm.zone || 'GENERAL SECTION';
      const unitKey = norm.unit || 'UNIT A';
      const styleKey = norm.style || 'UNKNOWN STYLE';

      if (!zonesMap[zoneKey]) {
        zonesMap[zoneKey] = {
          zoneName: zoneKey,
          pass: 0,
          rework: 0,
          fail: 0,
          total: 0,
          units: {}
        };
      }

      const zObj = zonesMap[zoneKey];
      zObj.pass += norm.pass;
      zObj.rework += norm.rework;
      zObj.fail += norm.fail;
      zObj.total += norm.checked;

      if (!zObj.units[unitKey]) {
        zObj.units[unitKey] = {
          unitName: unitKey,
          pass: 0,
          rework: 0,
          fail: 0,
          total: 0,
          styles: {}
        };
      }

      const uObj = zObj.units[unitKey];
      uObj.pass += norm.pass;
      uObj.rework += norm.rework;
      uObj.fail += norm.fail;
      uObj.total += norm.checked;

      if (!uObj.styles[styleKey]) {
        uObj.styles[styleKey] = {
          styleCode: styleKey,
          pass: 0,
          rework: 0,
          fail: 0,
          total: 0
        };
      }

      const sObj = uObj.styles[styleKey];
      sObj.pass += norm.pass;
      sObj.rework += norm.rework;
      sObj.fail += norm.fail;
      sObj.total += norm.checked;
    });

    // Transform and map to sorted arrays
    return Object.values(zonesMap).map(z => {
      const unitsList = Object.values(z.units).map(u => {
        const stylesList = Object.values(u.styles).map(s => ({
          ...s,
          passPercent: s.total > 0 ? ((s.pass / s.total) * 100).toFixed(1) : '0.0',
          reworkPercent: s.total > 0 ? ((s.rework / s.total) * 100).toFixed(1) : '0.0',
          failPercent: s.total > 0 ? ((s.fail / s.total) * 100).toFixed(1) : '0.0'
        })).sort((a, b) => b.total - a.total);

        return {
          ...u,
          styles: stylesList,
          passPercent: u.total > 0 ? ((u.pass / u.total) * 100).toFixed(1) : '0.0'
        };
      }).sort((a, b) => a.unitName.localeCompare(b.unitName));

      return {
        ...z,
        units: unitsList,
        passPercent: z.total > 0 ? ((z.pass / z.total) * 100).toFixed(1) : '0.0'
      };
    }).sort((a, b) => a.zoneName.localeCompare(b.zoneName));
  }, [rawRecords, globalZone, selectedDate, searchQuery]);

  // Download Daily Report as PDF via jsPDF with high-fidelity formatting
  const downloadDailyReportPDF = () => {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    // 1. Accent color styling block
    doc.setFillColor(79, 70, 229); // Royal Indigo Accent
    doc.rect(15, 15, 180, 2, 'F');

    // Title
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(18);
    doc.setTextColor(15, 23, 42); // slate 900
    doc.text("DAILY QUALITY AUDIT & DEFECT REPORT", 15, 24);

    // Subtitle
    doc.setFont("Helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(100, 116, 139); // slate 500
    doc.text("BLOSSOM QUALITY OPERATION SYSTEM (BQOS) • INTERNAL PRODUCTION PERFORMANCE", 15, 28);

    // 2. Metadata Box
    doc.setDrawColor(226, 232, 240); // slate 200 light border
    doc.rect(15, 32, 180, 24);

    doc.setFont("Helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(15, 23, 42);
    doc.text("REPORT AUDIT METADATA & FILTERS", 18, 37);

    // Left Column Info
    doc.setFont("Helvetica", "normal");
    doc.setFontSize(8);
    doc.text("Log Date:", 18, 42);
    doc.setFont("Helvetica", "bold");
    const displayDateStr = selectedDate 
      ? new Date(selectedDate).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }) 
      : 'All Historic Logs';
    doc.text(`${displayDateStr} (${selectedDate || 'ALL'})`, 36, 42);

    doc.setFont("Helvetica", "normal");
    doc.text("Target Units:", 18, 47);
    doc.setFont("Helvetica", "bold");
    doc.text(`${selectedUnits.length > 0 ? selectedUnits.join(', ') : 'No units selected'}`, 36, 47);

    doc.setFont("Helvetica", "normal");
    doc.text("Global Zone:", 18, 52);
    doc.setFont("Helvetica", "bold");
    doc.text(`${globalZone && globalZone !== 'ALL' ? globalZone : 'ALL FACTORY SECTIONS'}`, 36, 52);

    // Right Column Info
    doc.setFont("Helvetica", "normal");
    doc.text("Exported On:", 115, 42);
    doc.setFont("Helvetica", "bold");
    doc.text(`${new Date().toLocaleString()}`, 134, 42);

    doc.setFont("Helvetica", "normal");
    doc.text("Total Checked:", 115, 47);
    doc.setFont("Helvetica", "bold");
    doc.text(`${dReportSummary.totalChecked} Pieces`, 134, 47);

    doc.setFont("Helvetica", "normal");
    doc.text("Pass Rate:", 115, 52);
    doc.setFont("Helvetica", "bold");
    doc.text(`${dReportSummary.passRate}%`, 134, 52);

    // 3. KPI Scorecards Section
    const cardY = 60;
    const cardWidth = 33.5;
    const cardHeight = 20;
    const gap = 3.1;

    // Passed Pcs
    doc.setFillColor(240, 253, 244); // light green
    doc.setDrawColor(187, 247, 208);
    doc.rect(15, cardY, cardWidth, cardHeight, 'FD');
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(6.5);
    doc.setTextColor(21, 128, 61); // green-700
    doc.text("PASSED PRODUCTION", 17, cardY + 5);
    doc.setFontSize(13);
    doc.text(`${dReportSummary.totalPass}`, 17, cardY + 12);
    doc.setFontSize(5.5);
    doc.setFont("Helvetica", "normal");
    doc.text("Approved OK Pcs", 17, cardY + 17);

    // Rework Staged
    doc.setFillColor(254, 243, 199); // light orange
    doc.setDrawColor(253, 230, 138);
    doc.rect(15 + cardWidth + gap, cardY, cardWidth, cardHeight, 'FD');
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(6.5);
    doc.setTextColor(180, 83, 9); // orange-700
    doc.text("REWORK STAGED", 15 + cardWidth + gap + 2, cardY + 5);
    doc.setFontSize(13);
    doc.text(`${dReportSummary.totalRework}`, 15 + cardWidth + gap + 2, cardY + 12);
    doc.setFontSize(5.5);
    doc.setFont("Helvetica", "normal");
    doc.text("Needs Refurbishing", 15 + cardWidth + gap + 2, cardY + 17);

    // Rejections
    doc.setFillColor(254, 226, 226); // light red
    doc.setDrawColor(254, 205, 205);
    doc.rect(15 + (cardWidth + gap) * 2, cardY, cardWidth, cardHeight, 'FD');
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(6.5);
    doc.setTextColor(185, 28, 28); // red-700
    doc.text("REJECTIONS STAGE", 15 + (cardWidth + gap) * 2 + 2, cardY + 5);
    doc.setFontSize(13);
    doc.text(`${dReportSummary.totalFail}`, 15 + (cardWidth + gap) * 2 + 2, cardY + 12);
    doc.setFontSize(5.5);
    doc.setFont("Helvetica", "normal");
    doc.text("Irreparable Failures", 15 + (cardWidth + gap) * 2 + 2, cardY + 17);

    // TotalChecked
    doc.setFillColor(241, 245, 249); // light grey
    doc.setDrawColor(226, 232, 240);
    doc.rect(15 + (cardWidth + gap) * 3, cardY, cardWidth, cardHeight, 'FD');
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(6.5);
    doc.setTextColor(71, 85, 105); // grey-600
    doc.text("TOTAL AUDITED", 15 + (cardWidth + gap) * 3 + 2, cardY + 5);
    doc.setFontSize(13);
    doc.text(`${dReportSummary.totalChecked}`, 15 + (cardWidth + gap) * 3 + 2, cardY + 12);
    doc.setFontSize(5.5);
    doc.setFont("Helvetica", "normal");
    doc.text("Audited Cycles Count", 15 + (cardWidth + gap) * 3 + 2, cardY + 17);

    // Pass Rate
    doc.setFillColor(238, 242, 255); // light indigo
    doc.setDrawColor(199, 210, 254);
    doc.rect(15 + (cardWidth + gap) * 4, cardY, cardWidth, cardHeight, 'FD');
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(6.5);
    doc.setTextColor(67, 56, 202); // indigo-700
    doc.text("QUALITY PASS RATE", 15 + (cardWidth + gap) * 4 + 2, cardY + 5);
    doc.setFontSize(13);
    doc.text(`${dReportSummary.passRate}%`, 15 + (cardWidth + gap) * 4 + 2, cardY + 12);
    doc.setFontSize(5.5);
    doc.setFont("Helvetica", "normal");
    doc.text("Approved Ratio %", 15 + (cardWidth + gap) * 4 + 2, cardY + 17);

    // 4. Style-wise table using autoTable
    const tableHeaders = [["Style Code / ID", "Recording Units", "Approved OK", "Rework", "Rejection", "Total Audited", "Pass Rate %"]];
    const tableBody = styleWiseData.map(item => [
      item.styleCode,
      Array.from(item.units).join(', ') || 'N/A',
      item.pass.toString(),
      item.rework.toString(),
      item.fail.toString(),
      item.total.toString(),
      `${item.passPercent}%`
    ]);

    // Draw Section Title
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(9.5);
    doc.setTextColor(15, 23, 42);
    doc.text("STYLE-WISE PRODUCTION SUMMARY & DEFECT BREAKDOWNS", 15, 87);

    autoTable(doc, {
      startY: 91,
      head: tableHeaders,
      body: tableBody,
      theme: 'striped',
      headStyles: {
        fillColor: [79, 70, 229], // Indigo 600
        textColor: [255, 255, 255],
        fontSize: 8,
        fontStyle: 'bold',
        halign: 'center',
        valign: 'middle'
      },
      columnStyles: {
        0: { fontStyle: 'bold', halign: 'left', cellWidth: 40 },
        1: { halign: 'left', cellWidth: 35 },
        2: { halign: 'center' },
        3: { halign: 'center' },
        4: { halign: 'center' },
        5: { halign: 'center' },
        6: { fontStyle: 'bold', halign: 'center' }
      },
      styles: {
        fontSize: 7.5,
        cellPadding: 2.5,
        textColor: [51, 65, 85], // Slate 700
      },
      margin: { left: 15, right: 15 },
      didDrawPage: (dataBlock: any) => {
        // Simple page numbering and report stamp footer on all pages
        doc.setFont("Helvetica", "normal");
        doc.setFontSize(7);
        doc.setTextColor(148, 163, 184); // Slate 400
        const str = `Page ${doc.getNumberOfPages()}`;
        doc.text(str, 15, doc.internal.pageSize.height - 10);
        doc.text("Generated securely via Blossom Quality Operation System • Confidential Production Data", 70, doc.internal.pageSize.height - 10);
      }
    });

    // 5. Trigger download file save dialog window
    doc.save(`BQOS_DailyReport_${selectedDate || 'All_Logs'}.pdf`);
  };

  // Interfaces for Quality Analysis (C3)
  interface QualityIssue {
    id: string;
    module: 'A1' | 'A2' | 'A3' | 'A4' | 'A5' | 'A6';
    moduleName: string;
    checkingDate: string;
    style: string;
    description: string;
    reworkCount: number;
    failCount: number;
    quantity: number;
    severity: 'CRITICAL' | 'MAJOR' | 'MINOR';
    zone: string;
    inspector: string;
  }

  // Parse raw records from modules A1 - A6 dynamically to extract total issues
  const qualityIssuesData = useMemo(() => {
    if (id !== 'C4' || !allSubmodulesData) return [];

    const issues: QualityIssue[] = [];
    
    const getSafeString = (val: any) => String(val || '').trim().toUpperCase();
    const getSafeDate = (val: any) => {
      if (!val) return '';
      try {
        const d = new Date(val);
        return isNaN(d.getTime()) ? '' : d.toISOString().split('T')[0];
      } catch {
        return '';
      }
    };

    const matchesZone = (zoneStr: string) => {
      if (!globalZone || globalZone === 'ALL') return true;
      return getSafeString(zoneStr) === globalZone.toUpperCase();
    };

    const matchesDate = (dateStr: string) => {
      if (!selectedDate) return true;
      return dateStr === selectedDate;
    };

    const matchesSearch = (styleStr: string, desc: string) => {
      const q = searchQuery.trim().toUpperCase();
      if (!q) return true;
      return styleStr.includes(q) || desc.toUpperCase().includes(q);
    };

    // A1 - Material Inspection
    allSubmodulesData.material.forEach((r, idx) => {
      const pZone = getSafeString(r.zone || r.location);
      const pDate = getSafeDate(r.timestamp || r.receivedDate || r.checkingDate);
      const pStyle = getSafeString(r.itemName || r.style || 'MATERIAL');
      const rejectedQty = Number(r.rejectedQuantity || r.failQty || 0);
      const desc = getSafeString(r.itemRemarks || r.generalRemarks || 'Fabric lot non-conformance');

      if (rejectedQty > 0 || r.itemRemarks) {
        if (matchesZone(pZone) && matchesDate(pDate) && matchesSearch(pStyle, desc)) {
          issues.push({
            id: `A1-${idx}-${pStyle}`,
            module: 'A1',
            moduleName: 'Material Inspection',
            checkingDate: pDate || 'N/A',
            style: pStyle,
            description: r.itemRemarks || r.generalRemarks || `Rejected raw material: ${rejectedQty} units`,
            reworkCount: 0,
            failCount: rejectedQty,
            quantity: rejectedQty,
            severity: rejectedQty > 100 ? 'CRITICAL' : 'MAJOR',
            zone: pZone || 'RECEIVING DOCK',
            inspector: getSafeString(r.inspector || 'SHEET QC')
          });
        }
      }
    });

    // A2 - Cutting Quality
    allSubmodulesData.cutting.forEach((r, idx) => {
      const pZone = getSafeString(r.zone || r.location);
      const pDate = getSafeDate(r.timestamp || r.checkingDate);
      const pStyle = getSafeString(r.style || r.wo || r.workorderNumber || 'CUTTING');
      const reworked = Number(r.reworkQty || 0);
      const failure = Number(r.failQty || 0);
      const desc = getSafeString(r.remarks || 'Fabric cutting dimensional shift');

      if (failure > 0 || reworked > 0 || r.remarks) {
        if (matchesZone(pZone) && matchesDate(pDate) && matchesSearch(pStyle, desc)) {
          issues.push({
            id: `A2-${idx}-${pStyle}`,
            module: 'A2',
            moduleName: 'Cutting Quality',
            checkingDate: pDate || 'N/A',
            style: pStyle,
            description: r.remarks || (failure > 0 ? `Cutting Fail pieces check (${failure} Pcs)` : `Cutting rework pieces (${reworked} Pcs)`),
            reworkCount: reworked,
            failCount: failure,
            quantity: failure + reworked,
            severity: failure > 0 ? 'CRITICAL' : 'MAJOR',
            zone: pZone || 'CUTTING ROOM',
            inspector: getSafeString(r.inspector || 'CUT QC')
          });
        }
      }
    });

    // A3 - Inline Quality
    allSubmodulesData.inline.forEach((r, idx) => {
      const pZone = getSafeString(r.zone || r.location);
      const pDate = getSafeDate(r.timestamp || r.checkingDate);
      const pStyle = getSafeString(r.style || r.wo || r.workorderNumber || 'INLINE');
      const complaintQty = Number(r.complaintPcs || r.failQty || 0);
      const desc = getSafeString(r.remarks || 'Sewing balance imbalance issues');

      if (complaintQty > 0 || r.remarks) {
        if (matchesZone(pZone) && matchesDate(pDate) && matchesSearch(pStyle, desc)) {
          issues.push({
            id: `A3-${idx}-${pStyle}`,
            module: 'A3',
            moduleName: 'Inline Quality',
            checkingDate: pDate || 'N/A',
            style: pStyle,
            description: r.remarks || `Stitch complaints raised count: ${complaintQty}`,
            reworkCount: complaintQty,
            failCount: 0,
            quantity: complaintQty,
            severity: 'MINOR',
            zone: pZone || 'SEWING SECTION',
            inspector: getSafeString(r.inspector || 'INLINE ROVER')
          });
        }
      }
    });

    // A4 - Endline Quality
    allSubmodulesData.endline.forEach((r, idx) => {
      const pZone = getSafeString(r.zone || r.location);
      const pDate = getSafeDate(r.timestamp || r.checkingDate);
      const pStyle = getSafeString(r.style || r.wo || r.workorderNumber || 'ENDLINE');
      const reworked = Number(r.reworkQty || r.rework || 0);
      const failure = Number(r.failQty || r.fail || 0);
      const desc = getSafeString(r.defect || r.remarks || 'Endline inspection checks failed');

      if (failure > 0 || reworked > 0 || r.defect || r.remarks) {
        if (matchesZone(pZone) && matchesDate(pDate) && matchesSearch(pStyle, desc)) {
          issues.push({
            id: `A4-${idx}-${pStyle}`,
            module: 'A4',
            moduleName: 'Endline Quality',
            checkingDate: pDate || 'N/A',
            style: pStyle,
            description: `${r.defect || 'Sewing Assembly Deviation'} - ${r.remarks || 'No detailed code description'}`,
            reworkCount: reworked,
            failCount: failure,
            quantity: failure + reworked,
            severity: failure > 0 ? 'CRITICAL' : 'MAJOR',
            zone: pZone || 'ENDLINE SECTION',
            inspector: getSafeString(r.inspector || 'ENDLINE TABLES')
          });
        }
      }
    });

    // A5 - AQL Inspection
    allSubmodulesData.aql.forEach((r, idx) => {
      const pZone = getSafeString(r.zone || r.location);
      const pDate = getSafeDate(r.timestamp || r.checkingDate);
      const pStyle = getSafeString(r.style || r.wo || r.workorderNumber || 'AQL');
      const foundDef = Number(r.foundDefects || 0);
      const statusL = getSafeString(r.status);
      const desc = getSafeString(r.remarks || `AQL Quality Check Defects Found: ${foundDef}`);

      if (foundDef > 0 || statusL === 'FAIL' || r.remarks) {
        if (matchesZone(pZone) && matchesDate(pDate) && matchesSearch(pStyle, desc)) {
          issues.push({
            id: `A5-${idx}-${pStyle}`,
            module: 'A5',
            moduleName: 'AQL Inspection',
            checkingDate: pDate || 'N/A',
            style: pStyle,
            description: r.remarks || `Audit panel sample checking found: ${foundDef} defects. Status: ${statusL}`,
            reworkCount: 0,
            failCount: foundDef,
            quantity: foundDef,
            severity: statusL === 'FAIL' ? 'CRITICAL' : 'MAJOR',
            zone: pZone || 'AQL AUDIT LINE',
            inspector: getSafeString(r.inspector || 'AQL SURVEYOR')
          });
        }
      }
    });

    // A6 - Final Audit
    allSubmodulesData.finalAudit.forEach((r, idx) => {
      const pZone = getSafeString(r.zone || r.location);
      const pDate = getSafeDate(r.timestamp || r.checkingDate);
      const pStyle = getSafeString(r.style || r.wo || r.workorderNumber || 'FINAL_AUDIT');
      const rejected = Number(r.rejectedQty || r.failQty || 0);
      const statusL = getSafeString(r.status);
      const desc = getSafeString(r.remarks || 'Audit rejection gate triggered');

      if (rejected > 0 || statusL === 'FAIL' || r.remarks) {
        if (matchesZone(pZone) && matchesDate(pDate) && matchesSearch(pStyle, desc)) {
          issues.push({
            id: `A6-${idx}-${pStyle}`,
            module: 'A6',
            moduleName: 'Final Audit',
            checkingDate: pDate || 'N/A',
            style: pStyle,
            description: r.remarks || `Pre-shipment audit failed cartons. Status: ${statusL}`,
            reworkCount: 0,
            failCount: rejected || 1,
            quantity: rejected || 1,
            severity: 'CRITICAL',
            zone: pZone || 'WAREHOUSE SHIP GATE',
            inspector: getSafeString(r.inspector || 'AUDITING CHEF')
          });
        }
      }
    });

    return issues.sort((a, b) => {
      const priorityOrder = { 'CRITICAL': 0, 'MAJOR': 1, 'MINOR': 2 };
      if (priorityOrder[a.severity] !== priorityOrder[b.severity]) {
        return priorityOrder[a.severity] - priorityOrder[b.severity];
      }
      return b.checkingDate.localeCompare(a.checkingDate);
    });
  }, [allSubmodulesData, globalZone, selectedDate, searchQuery, id]);

  // Compute stats on priorities
  const criticalStatistics = useMemo(() => {
    if (id !== 'C4') return { critical: 0, major: 0, minor: 0, total: 0 };
    
    let critical = 0;
    let major = 0;
    let minor = 0;
    
    qualityIssuesData.forEach(iss => {
      if (iss.severity === 'CRITICAL') critical++;
      else if (iss.severity === 'MAJOR') major++;
      else if (iss.severity === 'MINOR') minor++;
    });

    return {
      critical,
      major,
      minor,
      total: qualityIssuesData.length
    };
  }, [qualityIssuesData, id]);

  // Compute breakdown ratios
  const moduleBreakdown = useMemo(() => {
    const modules: Record<'A1' | 'A2' | 'A3' | 'A4' | 'A5' | 'A6', { name: string; count: number; critical: number; major: number; minor: number }> = {
      A1: { name: 'Material Inspection', count: 0, critical: 0, major: 0, minor: 0 },
      A2: { name: 'Cutting Quality', count: 0, critical: 0, major: 0, minor: 0 },
      A3: { name: 'Inline Quality', count: 0, critical: 0, major: 0, minor: 0 },
      A4: { name: 'Endline Quality', count: 0, critical: 0, major: 0, minor: 0 },
      A5: { name: 'AQL Inspection', count: 0, critical: 0, major: 0, minor: 0 },
      A6: { name: 'Final Audit', count: 0, critical: 0, major: 0, minor: 0 }
    };

    qualityIssuesData.forEach(iss => {
      if (modules[iss.module]) {
        modules[iss.module].count++;
        if (iss.severity === 'CRITICAL') modules[iss.module].critical++;
        else if (iss.severity === 'MAJOR') modules[iss.module].major++;
        else if (iss.severity === 'MINOR') modules[iss.module].minor++;
      }
    });

    return Object.values(modules);
  }, [qualityIssuesData]);

  // Export Quality Analysis report as PDF
  const downloadQualityAnalysisPDF = () => {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    // Accent line
    doc.setFillColor(239, 68, 68); // Red Accent
    doc.rect(15, 15, 180, 2, 'F');

    // Title
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(15);
    doc.setTextColor(15, 23, 42); // slate 900
    doc.text("TOTAL QUALITY ANALYSIS & CRITICALITY LEDGER", 15, 24);

    // Subtitle
    doc.setFont("Helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(100, 116, 139); // slate 500
    doc.text("BLOSSOM QUALITY OPERATION SYSTEM (BQOS) • SEVERITY DISPATCH DOCKET (A1 - A6)", 15, 28);

    // Metadata Box
    doc.setDrawColor(226, 232, 240);
    doc.rect(15, 32, 180, 25);

    doc.setFont("Helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(15, 23, 42);
    doc.text("QUALITY ANALYSIS SUMMARY PARAMETERS", 18, 37);

    doc.setFont("Helvetica", "normal");
    doc.setFontSize(8);
    doc.text("Selected Date Scope:", 18, 42);
    doc.setFont("Helvetica", "bold");
    const displayDateStr = selectedDate 
      ? new Date(selectedDate).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }) 
      : 'All Logged Dates';
    doc.text(`${displayDateStr}`, 50, 42);

    doc.setFont("Helvetica", "normal");
    doc.text("Zone Scope Limit:", 18, 47);
    doc.setFont("Helvetica", "bold");
    doc.text(`${globalZone && globalZone !== 'ALL' ? globalZone : 'ALL SECTIONS & ZONES'}`, 50, 47);

    doc.setFont("Helvetica", "normal");
    doc.text("Style Lookup Filter:", 18, 52);
    doc.setFont("Helvetica", "bold");
    doc.text(`${searchQuery.trim() ? searchQuery.toUpperCase() : 'ALL STYLES'}`, 50, 52);

    // Severity matrix columns
    doc.setFont("Helvetica", "normal");
    doc.text("Total Issues Identified:", 115, 42);
    doc.setFont("Helvetica", "bold");
    doc.text(`${criticalStatistics.total} issues`, 147, 42);

    doc.setFont("Helvetica", "normal");
    doc.text("Severity Breakdown:", 115, 47);
    doc.setFont("Helvetica", "bold");
    doc.text(`CRITICAL: ${criticalStatistics.critical} | MAJOR: ${criticalStatistics.major} | MINOR: ${criticalStatistics.minor}`, 147, 47);

    let currentY = 62;

    if (qualityIssuesData.length === 0) {
      doc.setFont("Helvetica", "italic");
      doc.setFontSize(9);
      doc.setTextColor(100, 116, 139);
      doc.text("No active quality failures or issues logged matching current filter parameters.", 15, currentY);
    } else {
      const tableHeaders = [["Severity", "Date", "Source Module", "Style Ref", "Issue & Non-Compliance Remarks", "Zone/Line"]];
      const tableRows = qualityIssuesData.map(iss => [
        iss.severity,
        iss.checkingDate,
        iss.moduleName,
        iss.style,
        iss.description,
        iss.zone
      ]);

      autoTable(doc, {
        startY: currentY,
        head: tableHeaders,
        body: tableRows,
        theme: 'grid',
        headStyles: {
          fillColor: [30, 41, 59],
          textColor: [255, 255, 255],
          fontSize: 7.5,
          fontStyle: 'bold',
          halign: 'left'
        },
        columnStyles: {
          0: { fontStyle: 'bold', cellWidth: 20 },
          1: { cellWidth: 18 },
          2: { cellWidth: 32 },
          3: { fontStyle: 'bold', cellWidth: 22 },
          4: { cellWidth: 63 },
          5: { cellWidth: 25 },
        },
        styles: {
          fontSize: 7,
          cellPadding: 2,
          textColor: [51, 65, 85],
        },
        didParseCell: (cellData) => {
          if (cellData.section === 'body' && cellData.column.index === 0) {
            const val = cellData.cell.raw;
            if (val === 'CRITICAL') {
              cellData.cell.styles.textColor = [220, 38, 38];
              cellData.cell.styles.fontStyle = 'bold';
            } else if (val === 'MAJOR') {
              cellData.cell.styles.textColor = [217, 119, 6];
              cellData.cell.styles.fontStyle = 'bold';
            } else {
              cellData.cell.styles.textColor = [37, 99, 235];
            }
          }
        },
        margin: { left: 15, right: 15 },
        didDrawPage: () => {
          doc.setFont("Helvetica", "normal");
          doc.setFontSize(7);
          doc.setTextColor(148, 163, 184);
          doc.text(`Page ${doc.getNumberOfPages()} of Quality Dossier`, 15, doc.internal.pageSize.height - 10);
          doc.text("BQOS Quality Ledger System • Confidential Quality Report Document", 105, doc.internal.pageSize.height - 10);
        }
      });
    }

    doc.save(`BQOS_QualityAnalysis_${selectedDate || 'All'}.pdf`);
  };

  // Extract all workers with their general statistics for C6
  const workerSummaryList = useMemo(() => {
    if ((id !== 'C6' && id !== 'C3' && id !== 'C4') || !allSubmodulesData) return [];

    const stats: Record<string, {
      name: string;
      inlineChecks: number;
      inlineDefects: number;
      endlineChecks: number;
      endlineDefects: number;
      defects: Array<{
        id: string;
        date: string;
        source: string;
        style: string;
        defectType: string;
        operation: string;
        machine: string;
        qty: number;
        severity: 'CRITICAL' | 'MAJOR' | 'MINOR' | 'PASS';
        zone: string;
        unit: string;
        line: string;
        inspector: string;
        remarks: string;
      }>;
    }> = {};

    const getSafeString = (val: any) => String(val || '').trim().toUpperCase();
    const getSafeDate = (val: any) => {
      if (!val) return '';
      try {
        const d = new Date(val);
        return isNaN(d.getTime()) ? '' : d.toISOString().split('T')[0];
      } catch {
        return '';
      }
    };

    const initWorker = (name: string) => {
      if (!stats[name]) {
        stats[name] = {
          name,
          inlineChecks: 0,
          inlineDefects: 0,
          endlineChecks: 0,
          endlineDefects: 0,
          defects: []
        };
      }
    };

    // Preseed known workers so they always show up
    const seeded = ['WORKER 1', 'WORKER 2', 'WORKER 3', 'WORKER 4', 'WORKER 5'];
    seeded.forEach(w => initWorker(w));

    // 1. Process Inline Quality
    allSubmodulesData.inline.forEach((r, idx) => {
      const wName = getSafeString(r.worker || r.Worker || r.operator || r.operatorName || r.WORKER || r.operators || r.workers || '');
      if (!wName) return;
      initWorker(wName);

      const checked = Number(r.checkedQty || r.pcsChecked || 0);
      const defects = Number(r.complaintPcs || r.failQty || r.complaints || 0);
      const pDate = getSafeDate(r.timestamp || r.checkingDate || r.date) || 'N/A';
      
      stats[wName].inlineChecks += checked;
      stats[wName].inlineDefects += defects;

      stats[wName].defects.push({
        id: `inline-${idx}-${r.id || Math.random()}`,
        date: pDate,
        source: `Inline Quality (Round ${r.round || 'N/A'})`,
        style: getSafeString(r.style || r.wo || r.workorderNumber || 'UNKNOWN'),
        defectType: defects > 0 ? getSafeString(r.remarks || r.itemRemarks || 'Sewing deviance identified') : 'PASS (Compliant Run)',
        operation: getSafeString(r.operation || 'GENERAL SEWING'),
        machine: getSafeString(r.machine || 'SNLS'),
        qty: defects,
        severity: defects > 3 ? 'CRITICAL' : defects > 1 ? 'MAJOR' : defects > 0 ? 'MINOR' : 'PASS',
        zone: getSafeString(r.zone || r.location || 'SEWING SECTION'),
        unit: getSafeString(r.unit || 'UNIT A'),
        line: getSafeString(r.line || 'LINE 1'),
        inspector: getSafeString(r.inspector || 'INLINE ROVER'),
        remarks: r.generalRemarks || r.remarks || (defects === 0 ? 'No defects logged' : 'Inline inspection check')
      });
    });

    // 2. Process Endline Quality
    allSubmodulesData.endline.forEach((r, idx) => {
      const wName = getSafeString(r.worker || r.Worker || r.operator || r.operatorName || r.WORKER || r.operators || r.workers || '');
      if (!wName) return;
      initWorker(wName);

      const checked = Number(r.checkedQty || 1);
      const reworked = Number(r.reworkQty || 0);
      const failed = Number(r.failQty || 0);
      const defects = reworked + failed;
      const pDate = getSafeDate(r.timestamp || r.checkingDate) || 'N/A';

      stats[wName].endlineChecks += checked;
      stats[wName].endlineDefects += defects;

      stats[wName].defects.push({
        id: `endline-${idx}-${r.id || Math.random()}`,
        date: pDate,
        source: 'Endline Quality Table',
        style: getSafeString(r.style || r.wo || r.workorderNumber || 'UNKNOWN'),
        defectType: defects > 0 ? getSafeString(r.defect || 'Sewing Assembly Deviation') : 'PASS (Compliant Run)',
        operation: getSafeString(r.operation || 'SEWING OPERATION'),
        machine: getSafeString(r.machine || 'SNLS'),
        qty: defects,
        severity: failed > 0 ? 'CRITICAL' : reworked > 0 ? 'MAJOR' : 'PASS',
        zone: getSafeString(r.zone || r.location || 'ENDLINE ZONE'),
        unit: getSafeString(r.unit || 'UNIT A'),
        line: getSafeString(r.line || 'LINE 1'),
        inspector: getSafeString(r.inspector || 'ENDLINE TABLES'),
        remarks: r.remarks || (defects === 0 ? 'No defects logged' : 'Endline checked segment')
      });
    });

    // 3. Process Material Inspection (check for worker field)
    allSubmodulesData.material.forEach((r, idx) => {
      const wName = getSafeString(r.worker || r.Worker || r.operator || r.operatorName || r.WORKER || r.operators || r.workers || '');
      if (!wName) return;
      initWorker(wName);
      const checked = Number(r.checkedQuantity || r.receivedQuantity || 1);
      const rejected = Number(r.rejectedQuantity || r.failQty || 0);

      stats[wName].endlineChecks += checked;
      stats[wName].endlineDefects += rejected;

      stats[wName].defects.push({
        id: `material-${idx}-${r.id || Math.random()}`,
        date: getSafeDate(r.timestamp || r.receivedDate || r.checkingDate) || 'N/A',
        source: 'Material Inspection',
        style: getSafeString(r.itemName || r.style || 'MATERIAL'),
        defectType: rejected > 0 ? getSafeString(r.remarks || r.generalRemarks || 'Material Non-Conformance') : 'PASS (Compliant Material)',
        operation: 'MATERIAL VERIFICATION',
        machine: 'N/A',
        qty: rejected,
        severity: rejected > 100 ? 'CRITICAL' : rejected > 0 ? 'MAJOR' : 'PASS',
        zone: getSafeString(r.zone || r.location || 'RECEIVING DOCK'),
        unit: 'RECEIVING',
        line: 'N/A',
        inspector: getSafeString(r.inspector || 'SHEET QC'),
        remarks: r.generalRemarks || r.remarks || 'Material lot check'
      });
    });

    // 4. Process Cutting Quality (check for worker field)
    allSubmodulesData.cutting.forEach((r, idx) => {
      const wName = getSafeString(r.worker || r.Worker || r.operator || r.operatorName || r.WORKER || r.operators || r.workers || '');
      if (!wName) return;
      initWorker(wName);
      const checked = Number(r.checkedQty || 1);
      const reworked = Number(r.reworkQty || 0);
      const failed = Number(r.failQty || 0);
      const defects = reworked + failed;

      stats[wName].endlineChecks += checked;
      stats[wName].endlineDefects += defects;

      stats[wName].defects.push({
        id: `cutting-${idx}-${r.id || Math.random()}`,
        date: getSafeDate(r.timestamp || r.checkingDate) || 'N/A',
        source: 'Cutting Quality',
        style: getSafeString(r.style || r.wo || 'CUTSTYLE'),
        defectType: defects > 0 ? getSafeString(r.remarks || 'Cutting deviation logged') : 'PASS (Compliant Cutting)',
        operation: 'FABRIC CUTTING',
        machine: 'SPREADER',
        qty: defects,
        severity: failed > 0 ? 'CRITICAL' : reworked > 0 ? 'MAJOR' : 'PASS',
        zone: getSafeString(r.zone || r.location || 'CUTTING ROOM'),
        unit: 'CUTTING',
        line: 'N/A',
        inspector: getSafeString(r.inspector || 'CUT QC'),
        remarks: r.remarks || 'Cutting ply check'
      });
    });

    // 5. Process AQL Inspection (check for worker field)
    allSubmodulesData.aql.forEach((r, idx) => {
      const wName = getSafeString(r.worker || r.Worker || r.operator || r.operatorName || r.WORKER || r.operators || r.workers || '');
      if (!wName) return;
      initWorker(wName);
      const checked = Number(r.checkedQty || r.pcsChecked || 1);
      const defects = Number(r.failedPieces || r.failQty || r.foundDefects || 0);

      stats[wName].endlineChecks += checked;
      stats[wName].endlineDefects += defects;

      stats[wName].defects.push({
        id: `aql-${idx}-${r.id || Math.random()}`,
        date: getSafeDate(r.timestamp || r.checkingDate) || 'N/A',
        source: 'AQL Inspection',
        style: getSafeString(r.style || r.wo || 'AQLSTYLE'),
        defectType: defects > 0 ? getSafeString(r.remarks || 'AQL Deviant samples') : 'PASS (Compliant AQL Sample)',
        operation: 'AQL AUDIT',
        machine: 'N/A',
        qty: defects,
        severity: r.auditStatus === 'FAIL' || defects > 5 ? 'CRITICAL' : defects > 0 ? 'MAJOR' : 'PASS',
        zone: getSafeString(r.zone || r.location || 'AQL BAY'),
        unit: getSafeString(r.unit || 'AQL UNIT'),
        line: 'N/A',
        inspector: getSafeString(r.inspector || 'AQL QC'),
        remarks: r.remarks || 'AQL random sampling check'
      });
    });

    // 6. Process Final Audit (check for worker field)
    allSubmodulesData.finalAudit.forEach((r, idx) => {
      const wName = getSafeString(r.worker || r.Worker || r.operator || r.operatorName || r.WORKER || r.operators || r.workers || '');
      if (!wName) return;
      initWorker(wName);
      const checked = Number(r.checkedQty || r.pcsChecked || 1);
      const defects = Number(r.failedPieces || r.failQty || r.foundDefects || 0);

      stats[wName].endlineChecks += checked;
      stats[wName].endlineDefects += defects;

      stats[wName].defects.push({
        id: `finalAudit-${idx}-${r.id || Math.random()}`,
        date: getSafeDate(r.timestamp || r.checkingDate) || 'N/A',
        source: 'Final Audit',
        style: getSafeString(r.style || r.wo || 'FINALSTYLE'),
        defectType: defects > 0 ? getSafeString(r.remarks || 'Final audit deviations found') : 'PASS (Audit approved parcel)',
        operation: 'FINAL AUDIT PACKING',
        machine: 'N/A',
        qty: defects,
        severity: r.auditStatus === 'FAIL' || defects > 0 ? 'CRITICAL' : 'PASS',
        zone: getSafeString(r.zone || r.location || 'FINAL AUDIT GATES'),
        unit: getSafeString(r.unit || 'PACKING UNIT'),
        line: 'N/A',
        inspector: getSafeString(r.inspector || 'AUDITOR'),
        remarks: r.remarks || 'Final pre-shipment audit'
      });
    });

    return Object.values(stats).map(w => {
      const totalChecked = w.inlineChecks + w.endlineChecks;
      const totalDefects = w.inlineDefects + w.endlineDefects;
      const rate = totalChecked > 0 ? (totalDefects / totalChecked) * 100 : 0;
      
      let grade = 'A+';
      let badgeColor = 'text-emerald-600 bg-emerald-50 border-emerald-150';
      let statusText = 'STABLE';
      if (rate >= 10) {
        grade = 'D';
        badgeColor = 'text-rose-600 bg-rose-50 border-rose-150 animate-pulse';
        statusText = 'CRITICAL WATCH';
      } else if (rate >= 6) {
        grade = 'C';
        badgeColor = 'text-amber-600 bg-amber-50 border-amber-150';
        statusText = 'RE-INSPECTION ADVISORY';
      } else if (rate >= 3) {
        grade = 'B';
        badgeColor = 'text-yellow-600 bg-yellow-50 border-yellow-150';
        statusText = 'STABLE';
      } else if (rate >= 1) {
        grade = 'A';
        badgeColor = 'text-teal-600 bg-teal-50 border-teal-150';
        statusText = 'STABLE';
      }

      return {
        ...w,
        totalChecked,
        totalDefects,
        defectRate: Number(rate.toFixed(1)),
        grade,
        badgeColor,
        statusText
      };
    }).sort((a, b) => b.totalDefects - a.totalDefects);
  }, [allSubmodulesData, id]);

  // Extract all unique workorders from all submodules (Cutting, Inline, Endline, AQL, Final Audit)
  const uniqueWorkordersInData = useMemo(() => {
    if (!allSubmodulesData) return [];
    const wos = new Set<string>();
    
    // Cutting (A2)
    allSubmodulesData.cutting.forEach((r: any) => {
      const wo = String(r.wo || r.workorderNumber || '').trim().toUpperCase();
      if (wo) wos.add(wo);
    });
    
    // Inline (A3)
    allSubmodulesData.inline.forEach((r: any) => {
      const wo = String(r.wo || r.workorderNumber || '').trim().toUpperCase();
      if (wo) wos.add(wo);
    });
    
    // Endline (A4)
    allSubmodulesData.endline.forEach((r: any) => {
      const wo = String(r.wo || r.workorderNumber || '').trim().toUpperCase();
      if (wo) wos.add(wo);
    });
    
    // AQL (A5)
    allSubmodulesData.aql.forEach((r: any) => {
      const wo = String(r.wo || r.workorderNumber || '').trim().toUpperCase();
      if (wo) wos.add(wo);
    });
    
    // Final Audit (A6)
    allSubmodulesData.finalAudit.forEach((r: any) => {
      const wo = String(r.wo || r.workorderNumber || '').trim().toUpperCase();
      if (wo) wos.add(wo);
    });
    
    return Array.from(wos).sort();
  }, [allSubmodulesData]);

  const workorderAnalysisData = useMemo(() => {
    if (!allSubmodulesData) return null;
    
    // Find matching workorder number
    const targetWO = (selectedWorkorderId || '').trim().toUpperCase();
    if (!targetWO) return null;
    
    // Let's gather all checking records across submodules that match this workorder number
    const records: {
      id: string;
      stage: string;
      date: string;
      unit: string;
      line: string;
      worker: string;
      inspector: string;
      checkedQty: number;
      reworkQty: number;
      failQty: number;
      remarks: string;
      defectType: string;
      severity: 'CRITICAL' | 'MAJOR' | 'MINOR';
    }[] = [];
    
    let totalChecked = 0;
    let totalRework = 0;
    let totalFail = 0;
    let styleNames = new Set<string>();
    
    const getSafeDate = (val: any) => {
      if (!val) return 'N/A';
      try {
        const d = new Date(val);
        return isNaN(d.getTime()) ? 'N/A' : d.toISOString().split('T')[0];
      } catch {
        return 'N/A';
      }
    };
    
    // 1. Cutting Quality (A2)
    allSubmodulesData.cutting.forEach((r: any, idx: number) => {
      const wo = String(r.wo || r.workorderNumber || '').trim().toUpperCase();
      if (wo === targetWO) {
        if (r.style) styleNames.add(String(r.style).trim());
        const checked = Number(r.checkedQty || r.totalChecked || r.totalQty || 0);
        const reworked = Number(r.reworkQty || 0);
        const failed = Number(r.failQty || r.failQuantity || 0);
        totalChecked += checked;
        totalRework += reworked;
        totalFail += failed;
        
        if (reworked > 0 || failed > 0 || r.remarks) {
          records.push({
            id: `cutting-${idx}`,
            stage: 'Cutting Quality',
            date: getSafeDate(r.timestamp || r.checkingDate),
            unit: String(r.unit || 'Cutting Room').toUpperCase(),
            line: 'N/A',
            worker: 'N/A',
            inspector: String(r.inspector || 'CUT QC').toUpperCase(),
            checkedQty: checked,
            reworkQty: reworked,
            failQty: failed,
            remarks: String(r.remarks || 'Cutting deviation or dimensional shift'),
            defectType: failed > 0 ? 'Cutting Failure' : 'Cutting Rework',
            severity: failed > 0 ? 'CRITICAL' : 'MAJOR'
          });
        }
      }
    });

    // 2. Inline Quality (A3)
    allSubmodulesData.inline.forEach((r: any, idx: number) => {
      const wo = String(r.wo || r.workorderNumber || '').trim().toUpperCase();
      if (wo === targetWO) {
        if (r.style) styleNames.add(String(r.style).trim());
        const checked = Number(r.checkedPcs || r.totalChecked || 0);
        const complaints = Number(r.complaintPcs || r.failQty || 0);
        totalChecked += checked;
        totalRework += complaints; // Treated as rework/complaint
        
        if (complaints > 0 || r.remarks) {
          records.push({
            id: `inline-${idx}`,
            stage: 'Inline Quality',
            date: getSafeDate(r.timestamp || r.checkingDate),
            unit: String(r.unit || 'Sewing Room').toUpperCase(),
            line: String(r.line || 'N/A').toUpperCase(),
            worker: String(r.worker || 'N/A').toUpperCase(),
            inspector: String(r.inspector || 'INLINE ROVER').toUpperCase(),
            checkedQty: checked,
            reworkQty: complaints,
            failQty: 0,
            remarks: String(r.remarks || 'Stitch or balance imbalance'),
            defectType: 'Sewing Defect (Inline)',
            severity: 'MINOR'
          });
        }
      }
    });

    // 3. Endline Quality (A4)
    allSubmodulesData.endline.forEach((r: any, idx: number) => {
      const wo = String(r.wo || r.workorderNumber || '').trim().toUpperCase();
      if (wo === targetWO) {
        if (r.style) styleNames.add(String(r.style).trim());
        const checked = Number(r.checkedPcs || r.totalChecked || 0);
        const reworked = Number(r.reworkQty || r.rework || 0);
        const failed = Number(r.failQty || r.fail || 0);
        totalChecked += checked;
        totalRework += reworked;
        totalFail += failed;
        
        if (reworked > 0 || failed > 0 || r.defect || r.remarks) {
          records.push({
            id: `endline-${idx}`,
            stage: 'Endline Quality',
            date: getSafeDate(r.timestamp || r.checkingDate),
            unit: String(r.unit || 'Sewing Room').toUpperCase(),
            line: String(r.line || 'N/A').toUpperCase(),
            worker: String(r.worker || 'N/A').toUpperCase(),
            inspector: String(r.inspector || 'ENDLINE TABLES').toUpperCase(),
            checkedQty: checked,
            reworkQty: reworked,
            failQty: failed,
            remarks: `${String(r.defect || 'Sewing Assembly Deviation')} - ${String(r.remarks || 'No details')}`,
            defectType: String(r.defect || 'Endline Sewing defect'),
            severity: failed > 0 ? 'CRITICAL' : 'MAJOR'
          });
        }
      }
    });

    // 4. AQL Inspection (A5)
    allSubmodulesData.aql.forEach((r: any, idx: number) => {
      const wo = String(r.wo || r.workorderNumber || '').trim().toUpperCase();
      if (wo === targetWO) {
        if (r.style) styleNames.add(String(r.style).trim());
        const checked = Number(r.sampleSize || r.totalChecked || 0);
        const defects = Number(r.foundDefects || 0);
        const failed = r.status === 'FAIL' ? defects || 1 : 0;
        totalChecked += checked;
        totalFail += failed;
        totalRework += (r.status === 'PASS' && defects > 0) ? defects : 0;
        
        if (defects > 0 || r.status === 'FAIL' || r.remarks) {
          records.push({
            id: `aql-${idx}`,
            stage: 'AQL Inspection',
            date: getSafeDate(r.timestamp || r.checkingDate),
            unit: String(r.unit || 'AQL Room').toUpperCase(),
            line: 'N/A',
            worker: 'N/A',
            inspector: String(r.inspector || 'AQL INSPECTOR').toUpperCase(),
            checkedQty: checked,
            reworkQty: (r.status === 'PASS' && defects > 0) ? defects : 0,
            failQty: failed,
            remarks: String(r.remarks || `AQL Quality check. Defects: ${defects}, Status: ${r.status}`),
            defectType: 'AQL Sample Defect',
            severity: r.status === 'FAIL' ? 'CRITICAL' : 'MAJOR'
          });
        }
      }
    });

    // 5. Final Audit (A6)
    allSubmodulesData.finalAudit.forEach((r: any, idx: number) => {
      const wo = String(r.wo || r.workorderNumber || '').trim().toUpperCase();
      if (wo === targetWO) {
        if (r.style) styleNames.add(String(r.style).trim());
        const checked = Number(r.sampleSize || r.totalChecked || 0);
        const rejected = Number(r.rejectedQty || r.failQty || 0);
        const failed = r.status === 'FAIL' ? rejected || 1 : 0;
        totalChecked += checked;
        totalFail += failed;
        
        if (rejected > 0 || r.status === 'FAIL' || r.remarks) {
          records.push({
            id: `final-${idx}`,
            stage: 'Final Audit',
            date: getSafeDate(r.timestamp || r.checkingDate),
            unit: String(r.unit || 'Final Gate').toUpperCase(),
            line: 'N/A',
            worker: 'N/A',
            inspector: String(r.inspector || 'AUDITING CHIEF').toUpperCase(),
            checkedQty: checked,
            reworkQty: 0,
            failQty: failed,
            remarks: String(r.remarks || `Pre-shipment audit gate. Status: ${r.status}`),
            defectType: 'Audit Reject Case',
            severity: 'CRITICAL'
          });
        }
      }
    });
    
    return {
      workorderNumber: targetWO,
      styles: Array.from(styleNames),
      totalChecked,
      totalRework,
      totalFail,
      totalDefects: totalRework + totalFail,
      defectRate: totalChecked > 0 ? Number(((totalRework + totalFail) / totalChecked * 100).toFixed(1)) : 0,
      records
    };
  }, [allSubmodulesData, selectedWorkorderId]);

  const workordersWithDefectSummary = useMemo(() => {
    if (!allSubmodulesData) return [];
    
    const summaryMap: Record<string, {
      wo: string;
      styles: Set<string>;
      totalChecked: number;
      totalDefects: number;
      stages: Set<string>;
    }> = {};
    
    const getWO = (r: any) => String(r.wo || r.workorderNumber || '').trim().toUpperCase();
    
    // Process cutting
    allSubmodulesData.cutting.forEach(r => {
      const wo = getWO(r);
      if (!wo) return;
      if (!summaryMap[wo]) summaryMap[wo] = { wo, styles: new Set(), totalChecked: 0, totalDefects: 0, stages: new Set() };
      if (r.style) summaryMap[wo].styles.add(String(r.style).trim());
      summaryMap[wo].totalChecked += Number(r.checkedQty || r.totalChecked || 0);
      summaryMap[wo].totalDefects += Number(r.reworkQty || 0) + Number(r.failQty || 0);
      summaryMap[wo].stages.add('Cutting');
    });

    // Process inline
    allSubmodulesData.inline.forEach(r => {
      const wo = getWO(r);
      if (!wo) return;
      if (!summaryMap[wo]) summaryMap[wo] = { wo, styles: new Set(), totalChecked: 0, totalDefects: 0, stages: new Set() };
      if (r.style) summaryMap[wo].styles.add(String(r.style).trim());
      summaryMap[wo].totalChecked += Number(r.checkedPcs || 0);
      summaryMap[wo].totalDefects += Number(r.complaintPcs || 0);
      summaryMap[wo].stages.add('Inline');
    });

    // Process endline
    allSubmodulesData.endline.forEach(r => {
      const wo = getWO(r);
      if (!wo) return;
      if (!summaryMap[wo]) summaryMap[wo] = { wo, styles: new Set(), totalChecked: 0, totalDefects: 0, stages: new Set() };
      if (r.style) summaryMap[wo].styles.add(String(r.style).trim());
      summaryMap[wo].totalChecked += Number(r.checkedPcs || 0);
      summaryMap[wo].totalDefects += Number(r.reworkQty || 0) + Number(r.failQty || 0);
      summaryMap[wo].stages.add('Endline');
    });

    // Process AQL
    allSubmodulesData.aql.forEach(r => {
      const wo = getWO(r);
      if (!wo) return;
      if (!summaryMap[wo]) summaryMap[wo] = { wo, styles: new Set(), totalChecked: 0, totalDefects: 0, stages: new Set() };
      if (r.style) summaryMap[wo].styles.add(String(r.style).trim());
      summaryMap[wo].totalChecked += Number(r.sampleSize || 0);
      summaryMap[wo].totalDefects += Number(r.foundDefects || 0);
      summaryMap[wo].stages.add('AQL');
    });

    // Process Final Audit
    allSubmodulesData.finalAudit.forEach(r => {
      const wo = getWO(r);
      if (!wo) return;
      if (!summaryMap[wo]) summaryMap[wo] = { wo, styles: new Set(), totalChecked: 0, totalDefects: 0, stages: new Set() };
      if (r.style) summaryMap[wo].styles.add(String(r.style).trim());
      summaryMap[wo].totalChecked += Number(r.sampleSize || 0);
      summaryMap[wo].totalDefects += Number(r.rejectedQty || r.failQty || 0);
      summaryMap[wo].stages.add('Final Audit');
    });
    
    return Object.values(summaryMap).map(w => ({
      ...w,
      styles: Array.from(w.styles),
      stages: Array.from(w.stages)
    })).sort((a, b) => b.totalDefects - a.totalDefects);
  }, [allSubmodulesData]);

  const filteredWorkordersList = useMemo(() => {
    const q = workorderSearchInput.trim().toUpperCase();
    if (!q) return workordersWithDefectSummary;
    return workordersWithDefectSummary.filter(w => 
      w.wo.toUpperCase().includes(q) || 
      w.styles.some(s => s.toUpperCase().includes(q))
    );
  }, [workordersWithDefectSummary, workorderSearchInput]);

  const currentWorkerData = useMemo(() => {
    const sTerm = selectedWorker.trim().toUpperCase();
    const qTerm = searchQuery.trim().toUpperCase();
    
    if (sTerm) {
      return workerSummaryList.find(w => w.name.toUpperCase() === sTerm) || null;
    }
    
    if (qTerm) {
      // Find exact or partial match
      const match = workerSummaryList.find(w => w.name.toUpperCase() === qTerm) ||
                    workerSummaryList.find(w => w.name.toUpperCase().includes(qTerm));
      if (match) return match;
    }
    
    return null;
  }, [workerSummaryList, selectedWorker, searchQuery]);

  // Download Worker Report PDF
  const downloadWorkerReportPDF = () => {
    if (!currentWorkerData) return;
    
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    // Dark slate accent line
    doc.setFillColor(15, 23, 42); // slate 900
    doc.rect(15, 15, 180, 2, 'F');

    // Title
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(15);
    doc.setTextColor(15, 23, 42);
    doc.text("OPERATOR QUALITY DEVIATION & PERFORMANCE DOSSIER", 15, 24);

    // Subtitle
    doc.setFont("Helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(100, 116, 139);
    doc.text(`BLOSSOM QUALITY OPERATION SYSTEM (BQOS) • OPERATOR PROFILE: ${currentWorkerData.name}`, 15, 28);

    // Metadata box
    doc.setDrawColor(226, 232, 240);
    doc.rect(15, 32, 180, 25);

    doc.setFont("Helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(15, 23, 42);
    doc.text("QUALITY SUMMARY METRIC PROFILE", 18, 37);

    doc.setFont("Helvetica", "normal");
    doc.text("Operator Reference ID:", 18, 42);
    doc.setFont("Helvetica", "bold");
    doc.text(`${currentWorkerData.name}`, 55, 42);

    doc.setFont("Helvetica", "normal");
    doc.text("Total Logged Checked Pcs:", 18, 47);
    doc.setFont("Helvetica", "bold");
    doc.text(`${currentWorkerData.totalChecked} units`, 55, 47);

    doc.setFont("Helvetica", "normal");
    doc.text("Total Defective Pcs Identified:", 18, 52);
    doc.setFont("Helvetica", "bold");
    doc.text(`${currentWorkerData.totalDefects} units`, 55, 52);

    doc.setFont("Helvetica", "normal");
    doc.text("Defect Rate (%) Reference:", 115, 42);
    doc.setFont("Helvetica", "bold");
    doc.text(`${currentWorkerData.defectRate}%`, 155, 42);

    doc.setFont("Helvetica", "normal");
    doc.text("Operator Quality Banding:", 115, 47);
    doc.setFont("Helvetica", "bold");
    doc.text(`GRADE ${currentWorkerData.grade} (${currentWorkerData.statusText})`, 155, 47);

    doc.setFont("Helvetica", "normal");
    doc.text("Dossier Generation Date:", 115, 52);
    doc.setFont("Helvetica", "bold");
    doc.text(`${new Date().toLocaleDateString('en-US')}`, 155, 52);

    let currentY = 62;

    const filteredIssues = currentWorkerData.defects.filter(iss => {
      if (selectedDate && iss.date !== selectedDate) return false;
      if (globalZone && globalZone !== 'ALL' && iss.zone.toUpperCase() !== globalZone.toUpperCase()) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toUpperCase().trim();
        return iss.style.includes(q) || iss.defectType.includes(q) || iss.remarks.toUpperCase().includes(q) || iss.operation.includes(q);
      }
      return true;
    });

    if (filteredIssues.length === 0) {
      doc.setFont("Helvetica", "italic");
      doc.setFontSize(9);
      doc.setTextColor(100, 116, 139);
      doc.text("No matching active quality failures or defect history logged under this operator.", 15, currentY);
    } else {
      const tableHeaders = [["Severity", "Log Date", "Incident Module", "Style Ref", "Defect Details & Comments", "Operation", "Zone/Unit", "Inspector"]];
      const tableRows = filteredIssues.map(iss => [
        iss.severity,
        iss.date,
        iss.source,
        iss.style,
        iss.defectType + (iss.remarks ? ` - ${iss.remarks}` : ''),
        iss.operation,
        `${iss.zone} / ${iss.unit}`,
        iss.inspector
      ]);

      autoTable(doc, {
        startY: currentY,
        head: tableHeaders,
        body: tableRows,
        theme: 'grid',
        headStyles: {
          fillColor: [15, 23, 42],
          textColor: [255, 255, 255],
          fontSize: 7,
          fontStyle: 'bold',
          halign: 'left'
        },
        columnStyles: {
          0: { fontStyle: 'bold', cellWidth: 16 },
          1: { cellWidth: 16 },
          2: { cellWidth: 26 },
          3: { fontStyle: 'bold', cellWidth: 18 },
          4: { cellWidth: 46 },
          5: { cellWidth: 24 },
          6: { cellWidth: 20 },
          7: { cellWidth: 14 },
        },
        styles: {
          fontSize: 6.5,
          cellPadding: 1.5,
          textColor: [51, 65, 85],
        },
        didParseCell: (cellData) => {
          if (cellData.section === 'body' && cellData.column.index === 0) {
            const val = cellData.cell.raw;
            if (val === 'CRITICAL') {
              cellData.cell.styles.textColor = [220, 38, 38];
              cellData.cell.styles.fontStyle = 'bold';
            } else if (val === 'MAJOR') {
              cellData.cell.styles.textColor = [217, 119, 6];
              cellData.cell.styles.fontStyle = 'bold';
            } else {
              cellData.cell.styles.textColor = [37, 99, 235];
            }
          }
        },
        margin: { left: 15, right: 15 },
        didDrawPage: () => {
          doc.setFont("Helvetica", "normal");
          doc.setFontSize(7);
          doc.setTextColor(148, 163, 184);
          doc.text(`Page ${doc.getNumberOfPages()} of Operator Dossier`, 15, doc.internal.pageSize.height - 10);
          doc.text("BQOS Worker Performance Audit System • Confidential Document", 115, doc.internal.pageSize.height - 10);
        }
      });
    }

    doc.save(`BQOS_WorkerReport_${currentWorkerData.name}_${selectedDate || 'All'}.pdf`);
  };

  // Download Production Summary PDF dynamically in zone / unit hierarchy
  const downloadProductionSummaryPDF = () => {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    // 1. Accent color styling block
    doc.setFillColor(79, 70, 229); // indigo Accent
    doc.rect(15, 15, 180, 2, 'F');

    // Title
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(16);
    doc.setTextColor(15, 23, 42); // slate 900
    doc.text("ZONE & UNIT-WISE STYLE PRODUCTION SUMMARY", 15, 24);

    // Subtitle
    doc.setFont("Helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(100, 116, 139); // slate 500
    doc.text("BLOSSOM QUALITY OPERATION SYSTEM (BQOS) • PRODUCTION METADATA REPORT", 15, 28);

    // 2. Metadata Box
    doc.setDrawColor(226, 232, 240); // slate 200 light border
    doc.rect(15, 32, 180, 24);

    doc.setFont("Helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(15, 23, 42);
    doc.text("PRODUCTION SUMMARY METADATA", 18, 37);

    // Left Column Info
    doc.setFont("Helvetica", "normal");
    doc.setFontSize(8);
    doc.text("Log Date Scope:", 18, 42);
    doc.setFont("Helvetica", "bold");
    const displayDateStr = selectedDate 
      ? new Date(selectedDate).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }) 
      : 'All Historic Logs';
    doc.text(`${displayDateStr}`, 42, 42);

    doc.setFont("Helvetica", "normal");
    doc.text("Factory Sections:", 18, 47);
    doc.setFont("Helvetica", "bold");
    doc.text(`${globalZone && globalZone !== 'ALL' ? globalZone : 'ALL FACTORY SECTIONS'}`, 42, 47);

    doc.setFont("Helvetica", "normal");
    doc.text("Style Filter:", 18, 52);
    doc.setFont("Helvetica", "bold");
    doc.text(`${searchQuery.trim() ? '"' + searchQuery + '" style code input' : 'NONE (ALL STYLES)'}`, 42, 52);

    // Right Column Info
    doc.setFont("Helvetica", "normal");
    doc.text("Exported On:", 120, 42);
    doc.setFont("Helvetica", "bold");
    doc.text(`${new Date().toLocaleString()}`, 138, 42);

    doc.setFont("Helvetica", "normal");
    doc.text("Total Zones Loaded:", 120, 47);
    doc.setFont("Helvetica", "bold");
    const activeZonesCount = productionSummaryData.length;
    doc.text(`${activeZonesCount} active zones`, 148, 47);

    // 3. Draw style production list grouped by Zone -> then Unit
    let currentY = 62;

    if (productionSummaryData.length === 0) {
      doc.setFont("Helvetica", "italic");
      doc.setFontSize(9);
      doc.setTextColor(100, 116, 139);
      doc.text("No quality records or logs match the current filters.", 15, currentY);
    } else {
      productionSummaryData.forEach((zone, zIdx) => {
        // Zone Header Banner
        if (currentY > 240) {
          doc.addPage();
          currentY = 20;
        }

        doc.setFillColor(241, 245, 249); // slate 100
        doc.rect(15, currentY, 180, 7.5, 'F');
        
        doc.setFont("Helvetica", "bold");
        doc.setFontSize(8.5);
        doc.setTextColor(15, 23, 42);
        doc.text(`ZONE: ${zone.zoneName} (${zone.total} Pcs checked, ${zone.passPercent}% Pass Rate)`, 18, currentY + 5);
        
        currentY += 11;

        zone.units.forEach((unit, uIdx) => {
          if (currentY > 240) {
            doc.addPage();
            currentY = 20;
          }

          doc.setFont("Helvetica", "bold");
          doc.setFontSize(7.5);
          doc.setTextColor(79, 70, 229); // royal indigo
          doc.text(`▶ Unit Reference: ${unit.unitName} (Production: ${unit.total} Pcs, Pass Rate: ${unit.passPercent}%)`, 18, currentY);
          currentY += 3;

          // Style Breakdown Table
          const styleHeaders = [["Style Reference", "Approved OK Quantity", "Rework Staging", "Reject Pieces", "Total Audited", "Pass Rate %"]];
          const styleRows = unit.styles.map(sty => [
            sty.styleCode,
            sty.pass.toString(),
            sty.rework.toString(),
            sty.fail.toString(),
            sty.total.toString(),
            `${sty.passPercent}%`
          ]);

          autoTable(doc, {
            startY: currentY,
            head: styleHeaders,
            body: styleRows,
            theme: 'grid',
            headStyles: {
              fillColor: [71, 85, 105], // Slate 600
              textColor: [255, 255, 255],
              fontSize: 7.5,
              fontStyle: 'bold',
              halign: 'center'
            },
            columnStyles: {
              0: { fontStyle: 'bold', halign: 'left', cellWidth: 45 },
              1: { halign: 'center', textColor: [16, 185, 129] }, // Green for pass
              2: { halign: 'center', textColor: [245, 158, 11] }, // Amber for rework
              3: { halign: 'center', textColor: [239, 68, 68] }, // Red for fail
              4: { halign: 'center' },
              5: { fontStyle: 'bold', halign: 'center' }
            },
            styles: {
              fontSize: 7,
              cellPadding: 1.8,
              textColor: [51, 65, 85],
            },
            margin: { left: 18, right: 18 },
            didDrawPage: (dataBlock: any) => {
              // Number footer
              doc.setFont("Helvetica", "normal");
              doc.setFontSize(7);
              doc.setTextColor(148, 163, 184);
              const str = `Page ${doc.getNumberOfPages()}`;
              doc.text(str, 15, doc.internal.pageSize.height - 10);
              doc.text("BQOS Production Summary • Generated dynamically via secure workspace API", 65, doc.internal.pageSize.height - 10);
            }
          });

          // Update currentY
          currentY = (doc as any).lastAutoTable.finalY + 8;
        });

        currentY += 2; // spacer between zones
      });
    }

    doc.save(`BQOS_ProductionSummary_${selectedDate || 'All'}.pdf`);
  };

  const factoryPerformanceData = useMemo(() => {
    if (id !== 'C5' || !allSubmodulesData) return null;

    const zoneToFilter = (globalZone && globalZone !== 'ALL') ? globalZone.toUpperCase() : 'KERALA';

    // 1. Compile all records in the active zone
    const allRecords: any[] = [];
    const scanList = [
      { name: 'cutting', data: allSubmodulesData.cutting },
      { name: 'inline', data: allSubmodulesData.inline },
      { name: 'endline', data: allSubmodulesData.endline },
      { name: 'aql', data: allSubmodulesData.aql },
      { name: 'finalAudit', data: allSubmodulesData.finalAudit }
    ];

    scanList.forEach(group => {
      if (Array.isArray(group.data)) {
        group.data.forEach(r => {
          const norm = getNormalizedRecord(r);
          if (norm.zone === zoneToFilter) {
            allRecords.push({ ...norm, source: group.name });
          }
        });
      }
    });

    // 2. Extract unique units and dates
    const unitsSet = new Set<string>();
    const datesSet = new Set<string>();

    allRecords.forEach(r => {
      if (r.unit) unitsSet.add(r.unit);
      if (r.date) datesSet.add(r.date);
    });

    // Fallback units for Kerala specifically
    if (unitsSet.size === 0) {
      if (zoneToFilter === 'KERALA') {
        unitsSet.add('UNIT A');
        unitsSet.add('UNIT B');
      } else {
        unitsSet.add('UNIT A');
        unitsSet.add('UNIT B');
        unitsSet.add('UNIT C');
        unitsSet.add('UNIT D');
      }
    }

    const availableUnitsC5 = Array.from(unitsSet).sort();
    const availableDatesC5 = Array.from(datesSet).sort((a, b) => b.localeCompare(a));

    // Ensure currently selected unit is in the list
    let activeUnit = selectedUnitC5;
    if (!availableUnitsC5.includes(activeUnit)) {
      activeUnit = availableUnitsC5[0] || 'UNIT A';
    }

    // 3. Filter records by selected unit and selected date
    const filteredRecords = allRecords.filter(r => {
      if (r.unit !== activeUnit) return false;
      if (selectedDateC5 !== 'ALL' && r.date !== selectedDateC5) return false;
      return true;
    });

    // 4. Compute metrics: PRODUCTION, REWORK, REJECTION
    let totalChecked = 0;
    let totalPassed = 0;
    let totalRework = 0;
    let totalRejection = 0;

    // stylewise and sizewise combined aggregation
    const styleSizeMap: Record<string, { style: string; size: string; checked: number; pass: number; rework: number; fail: number }> = {};

    filteredRecords.forEach(r => {
      totalChecked += r.checked;
      totalPassed += r.pass;
      totalRework += r.rework;
      totalRejection += r.fail;

      const fullSize = r.cupsize ? `${r.size}${r.cupsize}` : r.size;
      const sizeKey = fullSize || 'N/A';
      const key = `${r.style}|||${sizeKey}`;

      if (!styleSizeMap[key]) {
        styleSizeMap[key] = { style: r.style, size: sizeKey, checked: 0, pass: 0, rework: 0, fail: 0 };
      }
      styleSizeMap[key].checked += r.checked;
      styleSizeMap[key].pass += r.pass;
      styleSizeMap[key].rework += r.rework;
      styleSizeMap[key].fail += r.fail;
    });

    const styleSizewise = Object.values(styleSizeMap).sort((a, b) => b.pass - a.pass);

    return {
      availableUnits: availableUnitsC5,
      availableDates: availableDatesC5,
      activeUnit,
      totalChecked,
      totalPassed,
      totalRework,
      totalRejection,
      styleSizewise
    };
  }, [allSubmodulesData, globalZone, selectedUnitC5, selectedDateC5, id]);

  if (loading) return <div className="p-12 text-center text-slate-400">Loading Report...</div>;

  // Render CUSTOM Daily Report (C1) style-wise dashboard
  if (id === 'C1') {
    return (
      <div className="space-y-6 animate-fade-in" id="daily-report-dashboard">
        
        {/* HEADER BLOCK WITH PDF DOWNLOAD */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b pb-4 border-slate-100">
          <div>
            <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight flex items-center gap-2">
              <Icon name="file-text" size={20} className="text-indigo-600" />
              Daily Quality Audit Report
            </h2>
            <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">
              Comprehensive style-wise defect status & production logs
            </p>
          </div>
          <button
            onClick={downloadDailyReportPDF}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs uppercase px-4 py-2.5 rounded-xl flex items-center gap-2 transition duration-200 shadow-md shadow-indigo-150 self-start sm:self-center cursor-pointer select-none"
          >
            <Icon name="download" size={14} />
            Export PDF Report
          </button>
        </div>
        
        {/* INTERACTIVE CONTROLS SECTION */}
        <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200/60 shadow-xs space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            {/* Style search */}
            <div className="space-y-1.5" id="style-search">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block">Style Reference Search</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                  <Icon name="search" size={14} />
                </span>
                <input
                  type="text"
                  placeholder="Type style reference code..."
                  className="w-full bg-white border border-slate-200 focus:border-indigo-500 rounded-xl py-2 pl-9 pr-4 text-xs font-bold outline-none transition placeholder-slate-350"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            {/* Quick Date Selector Dropdown */}
            <div className="space-y-1.5" id="date-selector">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block">Quick Select Log Date</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                  <Icon name="calendar" size={14} />
                </span>
                <SearchableSelect
                  className="w-full bg-white border border-slate-200 focus:border-indigo-500 rounded-xl py-2 pl-9 pr-4 text-xs font-bold outline-none transition appearance-none cursor-pointer"
                  value={selectedDate}
                  onChange={e => setSelectedDate(e.target.value)}
                >
                  <option value="">All Historic Logs</option>
                  {availableDates.map(date => (
                    <option key={date} value={date}>
                      {new Date(date).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </option>
                  ))}
                </SearchableSelect>
              </div>
            </div>

            {/* Date custom selection */}
            <div className="space-y-1.5" id="custom-date-input">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block">Or Select Custom Date</label>
              <input
                type="date"
                className="w-full bg-white border border-slate-200 focus:border-indigo-500 rounded-xl py-2 px-3 text-xs font-bold outline-none transition uppercase"
                value={selectedDate}
                onChange={e => setSelectedDate(e.target.value)}
              />
            </div>
          </div>

          {/* Dynamic Units selectors (Checkbox simulation pills) */}
          <div className="pt-2 border-t border-slate-200/50" id="unit-selection-pills">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Select Units to Analyze</label>
              <div className="flex gap-2">
                <button
                  onClick={() => setSelectedUnits(availableUnits)}
                  className="text-[10px] font-black hover:text-indigo-600 text-slate-450 uppercase tracking-wider transition"
                >
                  Select All Units
                </button>
                <span className="text-slate-350 font-bold text-xs select-none">•</span>
                <button
                  onClick={() => setSelectedUnits([])}
                  className="text-[10px] font-black hover:text-rose-500 text-slate-450 uppercase tracking-wider transition"
                >
                  Deselect All
                </button>
              </div>
            </div>
            
            {availableUnits.length === 0 ? (
              <p className="text-[10px] text-slate-400 italic">No recording units found in quality database.</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {availableUnits.map(unit => {
                  const isActive = selectedUnits.includes(unit);
                  return (
                    <button
                      key={unit}
                      onClick={() => {
                        if (isActive) {
                          setSelectedUnits(selectedUnits.filter(u => u !== unit));
                        } else {
                          setSelectedUnits([...selectedUnits, unit]);
                        }
                      }}
                      className={`px-3 py-1.5 rounded-lg text-xs font-black tracking-wide uppercase border-2 transition-all duration-200 select-none ${
                        isActive 
                          ? 'bg-indigo-600 border-indigo-700 text-white shadow-xs' 
                          : 'bg-white border-slate-200/70 text-slate-400 hover:border-slate-300 hover:text-slate-600'
                      }`}
                    >
                      {unit}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* METRICS STATS OVERVIEW CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4" id="kpi-metrics-overview">
          
          {/* Passed Production Card */}
          <div className="p-4 bg-white rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between hover:border-slate-200 transition">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Passed Production</span>
                <span className="p-1 px-1.5 text-[8px] bg-emerald-50 text-emerald-700 rounded-md font-bold uppercase tracking-wider">OK Pcs</span>
              </div>
              <p className="text-3xl font-black text-emerald-600 mt-2 font-mono">{dReportSummary.totalPass}</p>
            </div>
            <p className="text-[10px] text-emerald-600 font-bold mt-2 flex items-center gap-1">
              <Icon name="check-circle" size={10} /> Completed Approved Pcs
            </p>
          </div>

          {/* Rework Card */}
          <div className="p-4 bg-white rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between hover:border-slate-200 transition">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Rework Staged</span>
                <span className="p-1 px-1.5 text-[8px] bg-amber-50 text-amber-700 rounded-md font-bold uppercase tracking-wider">Action</span>
              </div>
              <p className="text-3xl font-black text-amber-500 mt-2 font-mono">{dReportSummary.totalRework}</p>
            </div>
            <p className="text-[10px] text-amber-600 font-bold mt-2 flex items-center gap-1">
              <Icon name="alert-triangle" size={10} /> Needs Refurbishing
            </p>
          </div>

          {/* Rejection Card */}
          <div className="p-4 bg-white rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between hover:border-slate-200 transition">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Rejections</span>
                <span className="p-1 px-1.5 text-[8px] bg-rose-50 text-rose-700 rounded-md font-bold uppercase tracking-wider">Failed</span>
              </div>
              <p className="text-3xl font-black text-rose-600 mt-2 font-mono">{dReportSummary.totalFail}</p>
            </div>
            <p className="text-[10px] text-rose-500 font-bold mt-2 flex items-center gap-1">
              <Icon name="x-circle" size={10} /> Irreparable Reject pieces
            </p>
          </div>

          {/* Total Checked */}
          <div className="p-4 bg-white rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between hover:border-slate-200 transition">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Checked</span>
                <span className="p-1 px-1.5 text-[8px] bg-slate-100 text-slate-600 rounded-md font-bold uppercase tracking-wider">Volume</span>
              </div>
              <p className="text-3xl font-black text-slate-800 mt-2 font-mono">{dReportSummary.totalChecked}</p>
            </div>
            <p className="text-[10px] text-indigo-650 font-bold mt-2 flex items-center gap-1">
              <Icon name="info" size={10} /> Total Audited Cycles
            </p>
          </div>

          {/* Quality Pass %, Progress bar */}
          <div className="p-4 bg-white rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between hover:border-slate-200 transition">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-indigo-600 font-black uppercase tracking-widest">Quality Pass Rate</span>
                <span className="p-1 px-1.5 text-[8px] bg-indigo-50 text-indigo-700 rounded-md font-bold uppercase tracking-wider">Ratio</span>
              </div>
              <p className="text-3xl font-black text-indigo-600 mt-2 font-mono">{dReportSummary.passRate}%</p>
            </div>
            <div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden mt-2">
                <div 
                  className={`h-2 rounded-full transition-all duration-500 ${
                    Number(dReportSummary.passRate) >= 95 ? 'bg-emerald-500' :
                    Number(dReportSummary.passRate) >= 85 ? 'bg-indigo-500' : 'bg-rose-500'
                  }`}
                  style={{ width: `${Math.min(100, Number(dReportSummary.passRate))}%` }}
                />
              </div>
              <p className="text-[9px] text-slate-450 mt-1 font-semibold">Pass Quantity ratio</p>
            </div>
          </div>
        </div>

        {/* TABLE AND COMPARISON PLOT CONTAINER */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6" id="stylewise-table-and-charts">
          
          {/* STYLE-WISE DATA TABLE */}
          <div className="xl:col-span-2 bg-white rounded-2xl border border-slate-200/60 shadow-xs p-5 space-y-4 overflow-hidden" id="stylewise-results-table">
            <div className="flex flex-col md:flex-row md:items-center justify-between border-b pb-3 border-slate-100 gap-2">
              <div>
                <h3 className="text-sm font-black text-slate-800 uppercase tracking-tight flex items-center gap-2">
                  <Icon name="list" size={16} className="text-indigo-600" />
                  Style-Wise production summary & defect logs
                </h3>
                <p className="text-[10px] text-slate-400 mt-0.5 font-bold">
                  Grouped style checking statistics for {selectedUnits.length > 0 ? selectedUnits.join(', ') : 'no units selected'}
                </p>
              </div>
              <span className="text-[10px] font-extrabold text-indigo-600 bg-indigo-50 rounded-full px-3 py-1 font-mono uppercase">
                {styleWiseData.length} Styles Loaded
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr className="border-b border-slate-150 bg-slate-50/50 text-[10px] font-black text-slate-500 uppercase tracking-widest select-none">
                    <th className="py-3 px-4">Style Code</th>
                    <th className="py-3 px-3">Units Run</th>
                    <th className="py-3 px-3 text-center">Completed Approved</th>
                    <th className="py-3 px-3 text-center">Rework</th>
                    <th className="py-3 px-3 text-center">Rejection</th>
                    <th className="py-3 px-4 text-center">Total Audited</th>
                    <th className="py-3 px-4 text-center">Pass Rate %</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs font-semibold">
                  {styleWiseData.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-slate-400 italic">
                        No quality audit logs matching the given filter conditions are available in database.
                      </td>
                    </tr>
                  ) : (
                    styleWiseData.map(item => (
                      <tr key={item.styleCode} className="hover:bg-slate-50/50 transition duration-150">
                        {/* STYLE */}
                        <td className="py-3.5 px-4 font-black text-slate-800 tracking-tight flex items-center gap-2">
                          <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full flex-shrink-0" />
                          {item.styleCode}
                        </td>
                        {/* UNITS */}
                        <td className="py-3 px-3">
                          <div className="flex flex-wrap gap-1 max-w-[140px]">
                            {Array.from(item.units).map(u => (
                              <span key={u} className="px-1.5 py-0.5 text-[8px] font-black bg-indigo-50 text-indigo-700 uppercase rounded tracking-wide border border-indigo-150/40">
                                {u}
                              </span>
                            ))}
                          </div>
                        </td>
                        {/* COMPLETE/PASS */}
                        <td className="py-3 px-3 text-center text-emerald-600 font-extrabold text-sm font-mono">
                          {item.pass}
                        </td>
                        {/* REWORK */}
                        <td className="py-3 px-3 text-center text-amber-500 font-extrabold text-sm font-mono">
                          {item.rework}
                        </td>
                        {/* REJECTION */}
                        <td className="py-3 px-3 text-center text-rose-600 font-extrabold text-sm font-mono">
                          {item.fail}
                        </td>
                        {/* TOTAL */}
                        <td className="py-3 px-4 text-center text-slate-650 font-extrabold text-sm font-mono">
                          {item.total}
                        </td>
                        {/* RATE */}
                        <td className="py-3 px-4">
                          <div className="flex flex-col items-center gap-1 justify-center">
                            <span className={`text-[11px] font-black font-mono ${
                              Number(item.passPercent) >= 95 ? 'text-emerald-600' :
                              Number(item.passPercent) >= 85 ? 'text-indigo-650' : 'text-rose-500'
                            }`}>
                              {item.passPercent}%
                            </span>
                            <div className="w-16 bg-slate-100 h-1 rounded-full overflow-hidden">
                              <div 
                                className={`h-1 rounded-full transition-all duration-300 ${
                                  Number(item.passPercent) >= 95 ? 'bg-emerald-500' :
                                  Number(item.passPercent) >= 85 ? 'bg-indigo-500' : 'bg-rose-400'
                                }`} 
                                style={{ width: `${Math.min(100, Number(item.passPercent))}%` }}
                              />
                            </div>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* HORIZONTAL STACKED COMPARISON GRAPH */}
          <div className="bg-white rounded-2xl border border-slate-200/60 shadow-xs p-5 space-y-4 flex flex-col justify-between" id="stylewise-plots-panel">
            <div>
              <h3 className="text-sm font-black text-slate-800 uppercase tracking-wide flex items-center gap-2">
                <Icon name="bar-chart-2" size={16} className="text-indigo-600" />
                Production vs Defects Plot
              </h3>
              <p className="text-[10px] text-slate-400 font-medium">
                Style comparison by completed pieces (OK), reresolving logs (rework), and failed reject bundles
              </p>
            </div>

            <div className="h-80 w-full pt-4">
              {styleWiseData.length === 0 ? (
                <div className="h-full flex items-center justify-center text-slate-400 italic text-xs border border-dashed border-slate-200 rounded-xl">
                  No visual chart records to render.
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={styleWiseData} layout="vertical" margin={{ left: -10, right: 10, top: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                    <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: '#64748b' }} />
                    <YAxis type="category" dataKey="styleCode" axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: '#1e293b', fontWeight: 'bold' }} />
                    <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', fontSize: '10px' }} />
                    <Legend verticalAlign="top" iconType="circle" align="right" wrapperStyle={{ fontSize: '9px', marginTop: '-15px', paddingBottom: '15px' }} />
                    <Bar dataKey="pass" fill="#10b981" name="Production Done" radius={[0, 4, 4, 0]} barSize={12} stackId="styles" />
                    <Bar dataKey="rework" fill="#f59e0b" name="Rework Count" radius={[0, 4, 4, 0]} barSize={12} stackId="styles" />
                    <Bar dataKey="fail" fill="#ef4444" name="Rejected Pcs" radius={[0, 4, 4, 0]} barSize={12} stackId="styles" />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Render CUSTOM Production Summary (C2) - Style-wise, Unit-wise, Zone-wise List Layout
  if (id === 'C2') {
    return (
      <div className="space-y-6 animate-fade-in" id="production-summary-dashboard">
        
        {/* HEADER BLOCK WITH PDF DOWNLOAD */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b pb-4 border-slate-100">
          <div>
            <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight flex items-center gap-2">
              <Icon name="activity" size={20} className="text-violet-600" />
              Zone-wise Production Summary
            </h2>
            <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">
              Style-wise production runs tracked by factory zone & unit list
            </p>
          </div>
          <button
            onClick={downloadProductionSummaryPDF}
            className="bg-violet-600 hover:bg-violet-700 text-white font-black text-xs uppercase px-4 py-2.5 rounded-xl flex items-center gap-2 transition duration-200 shadow-md shadow-violet-100 self-start sm:self-center cursor-pointer select-none"
          >
            <Icon name="download" size={14} />
            Export Summary Report
          </button>
        </div>

        {/* SEARCH AND DATE FILTERS */}
        <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200/60 shadow-xs space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            {/* Style search */}
            <div className="space-y-1.5" id="c2-style-search">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block">Search Style Reference</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                  <Icon name="search" size={14} />
                </span>
                <input
                  type="text"
                  placeholder="Type style reference code..."
                  className="w-full bg-white border border-slate-200 focus:border-violet-500 rounded-xl py-2 pl-9 pr-4 text-xs font-bold outline-none transition placeholder-slate-350"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            {/* Quick Date Selector Dropdown */}
            <div className="space-y-1.5" id="c2-date-selector">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block">Quick Select Date</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                  <Icon name="calendar" size={14} />
                </span>
                <SearchableSelect
                  className="w-full bg-white border border-slate-200 focus:border-violet-500 rounded-xl py-2 pl-9 pr-4 text-xs font-bold outline-none transition appearance-none cursor-pointer"
                  value={selectedDate}
                  onChange={e => setSelectedDate(e.target.value)}
                >
                  <option value="">All Historic Logs</option>
                  {availableDates.map(date => (
                    <option key={date} value={date}>
                      {new Date(date).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </option>
                  ))}
                </SearchableSelect>
              </div>
            </div>

            {/* Custom Date Input */}
            <div className="space-y-1.5" id="c2-custom-date-input">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block">Select Custom Date</label>
              <input
                type="date"
                className="w-full bg-white border border-slate-200 focus:border-violet-500 rounded-xl py-2 px-3 text-xs font-bold outline-none transition uppercase"
                value={selectedDate}
                onChange={e => setSelectedDate(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* HIERARCHICAL ZONE & UNIT STYLE LEVEL COOPERATIVE LIST */}
        <div className="space-y-4" id="hierarchical-style-list">
          {productionSummaryData.length === 0 ? (
            <div className="p-16 text-center bg-white border border-dashed border-slate-250 rounded-2xl shadow-sm space-y-3">
              <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 border border-slate-100 mx-auto">
                <Icon name="info" size={18} />
              </div>
              <div className="space-y-1">
                <p className="font-extrabold text-slate-700 text-sm uppercase tracking-wide">No production records found</p>
                <p className="text-xs text-slate-450">Try selecting a different date or clearing the style lookup search filters.</p>
              </div>
            </div>
          ) : (
            productionSummaryData.map(zone => {
              const isZoneExpanded = expandedZones[zone.zoneName] !== false;
              return (
                <div key={zone.zoneName} className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden transition-all">
                  
                  {/* ZONE BANNER CARD HEADER */}
                  <div 
                    onClick={() => setExpandedZones(prev => ({ ...prev, [zone.zoneName]: !isZoneExpanded }))}
                    className="p-4 bg-slate-50 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-3 cursor-pointer select-none hover:bg-slate-100/60 transition"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-indigo-50 border border-indigo-150 rounded-xl flex items-center justify-center text-indigo-600">
                        <Icon name="map-pin" size={18} />
                      </div>
                      <div>
                        <h3 className="font-black text-slate-800 tracking-tight uppercase text-sm flex items-center gap-2">
                          ZONE: {zone.zoneName}
                        </h3>
                        <p className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wide">
                          Audit Zone Node Reference
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-xs font-semibold">
                      <div className="bg-white px-3 py-1.5 rounded-lg border border-slate-200 flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-500" />
                        <span className="text-[10px] text-slate-500 uppercase font-black">Pass:</span>
                        <span className="font-mono font-bold text-slate-800">{zone.pass}</span>
                      </div>
                      <div className="bg-white px-3 py-1.5 rounded-lg border border-slate-200 flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-amber-400" />
                        <span className="text-[10px] text-slate-500 uppercase font-black">Rework:</span>
                        <span className="font-mono font-bold text-slate-800">{zone.rework}</span>
                      </div>
                      <div className="bg-white px-3 py-1.5 rounded-lg border border-slate-200 flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-rose-500" />
                        <span className="text-[10px] text-slate-500 uppercase font-black">Fail:</span>
                        <span className="font-mono font-bold text-slate-800">{zone.fail}</span>
                      </div>
                      <div className="bg-indigo-50 border border-indigo-150 px-3 py-1.5 rounded-lg text-indigo-700 font-bold font-mono">
                        {zone.passPercent}% Checked Pass
                      </div>
                      <div className="text-slate-400">
                        <Icon name={isZoneExpanded ? "chevron-up" : "chevron-down"} size={16} />
                      </div>
                    </div>
                  </div>

                  {/* UNITS AND STYLE LIST (COLLAPSIBLE CONTENT) */}
                  {isZoneExpanded && (
                    <div className="p-4 space-y-4 bg-white divide-y divide-slate-100">
                      {zone.units.length === 0 ? (
                        <p className="text-center text-xs text-slate-400 py-4 italic">No units run data logged under this zone node.</p>
                      ) : (
                        zone.units.map(unit => {
                          const unitCollapseKey = `${zone.zoneName}-${unit.unitName}`;
                          const isUnitExpanded = expandedUnits[unitCollapseKey] !== false;
                          
                          return (
                            <div key={unit.unitName} className="pt-4 first:pt-0 space-y-3">
                              
                              {/* UNIT COLLAPSIBLE HEADER ROW */}
                              <div 
                                onClick={() => setExpandedUnits(prev => ({ ...prev, [unitCollapseKey]: !isUnitExpanded }))}
                                className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 cursor-pointer select-none transition border border-transparent hover:border-slate-150"
                              >
                                <div className="flex items-center gap-2">
                                  <Icon name="home" size={14} className="text-indigo-600" />
                                  <h4 className="font-extrabold text-slate-700 uppercase tracking-tight text-xs flex items-center gap-2">
                                    {unit.unitName} Style Log Summary 
                                    <span className="bg-slate-100 text-slate-500 font-mono text-[9px] px-1.5 py-0.5 rounded-md font-bold">
                                      {unit.styles.length} Styles run
                                    </span>
                                  </h4>
                                </div>

                                <div className="flex items-center gap-4 text-xs">
                                  <div className="hidden lg:flex items-center gap-3 text-[11px] font-bold text-slate-500 font-mono">
                                    <span>Pass: <strong className="text-emerald-600">{unit.pass}</strong></span>
                                    <span>Rework: <strong className="text-amber-500">{unit.rework}</strong></span>
                                    <span>Fail: <strong className="text-rose-600">{unit.fail}</strong></span>
                                    <span>Total: <strong className="text-slate-700">{unit.total}</strong></span>
                                  </div>
                                  <span className="text-[10px] font-black uppercase text-indigo-600 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-md font-mono">
                                    {unit.passPercent}% Unit OK
                                  </span>
                                  <div className="text-slate-400">
                                    <Icon name={isUnitExpanded ? "chevron-up" : "chevron-down"} size={14} />
                                  </div>
                                </div>
                              </div>

                              {/* LIST OF STYLE CARDS */}
                              {isUnitExpanded && (
                                <div className="pl-4 pr-1 space-y-2 lg:grid lg:grid-cols-1 lg:gap-2">
                                  {unit.styles.length === 0 ? (
                                    <p className="text-xs text-slate-400 italic py-2 pl-4">No specific styles run data available.</p>
                                  ) : (
                                    unit.styles.map(sty => {
                                      const passW = sty.total > 0 ? (sty.pass / sty.total) * 100 : 0;
                                      const reworkW = sty.total > 0 ? (sty.rework / sty.total) * 100 : 0;
                                      const failW = sty.total > 0 ? (sty.fail / sty.total) * 100 : 0;

                                      return (
                                        <div 
                                          key={sty.styleCode} 
                                          className="p-4 bg-slate-50/50 hover:bg-slate-50 rounded-xl border border-slate-150 hover:border-slate-200 transition-all duration-150 flex flex-col md:flex-row md:items-center justify-between gap-4"
                                        >
                                          {/* Style Name details */}
                                          <div className="flex items-center gap-2.5">
                                            <div className="w-1.5 h-7 bg-indigo-500 rounded-full" />
                                            <div>
                                              <span className="text-xs font-black text-slate-900 font-mono tracking-tight uppercase flex items-center gap-1.5">
                                                {sty.styleCode}
                                              </span>
                                              <span className="text-[9px] uppercase tracking-wide font-black bg-indigo-50 text-indigo-700 px-1 py-0.5 rounded">
                                                Active Design Code
                                              </span>
                                            </div>
                                          </div>

                                          {/* Fluid Multicolored Stacked Progress Bar */}
                                          <div className="flex-1 max-w-sm md:max-w-md lg:max-w-lg space-y-1">
                                            <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden flex shadow-inner">
                                              {passW > 0 && <div className="bg-emerald-500 h-full transition-all duration-300" style={{ width: `${passW}%` }} title={`Pass: ${sty.pass} (${passW.toFixed(1)}%)`} />}
                                              {reworkW > 0 && <div className="bg-amber-400 h-full transition-all duration-300" style={{ width: `${reworkW}%` }} title={`Rework: ${sty.rework} (${reworkW.toFixed(1)}%)`} />}
                                              {failW > 0 && <div className="bg-rose-500 h-full transition-all duration-300" style={{ width: `${failW}%` }} title={`Fail: ${sty.fail} (${failW.toFixed(1)}%)`} />}
                                            </div>
                                            <div className="flex items-center justify-between text-[9px] font-bold text-slate-400 uppercase tracking-widest px-0.5 select-none font-mono">
                                              <span>{passW.toFixed(0)}% OK</span>
                                              <span>{reworkW.toFixed(0)}% REWORK</span>
                                              <span>{failW.toFixed(0)}% REJECT</span>
                                            </div>
                                          </div>

                                          {/* Itemized Quantities Display & Badge */}
                                          <div className="flex flex-wrap items-center gap-3.5 mt-2 md:mt-0 font-semibold text-xs justify-end font-sans">
                                            <div className="flex items-center gap-1 font-mono text-[11px]">
                                              <span className="text-slate-400 font-medium">OK:</span>
                                              <strong className="text-emerald-600 font-bold">{sty.pass}</strong>
                                            </div>
                                            <div className="flex items-center gap-1 font-mono text-[11px]">
                                              <span className="text-slate-400 font-medium">Rework:</span>
                                              <strong className="text-amber-500 font-bold">{sty.rework}</strong>
                                            </div>
                                            <div className="flex items-center gap-1 font-mono text-[11px]">
                                              <span className="text-slate-400 font-medium">Reject:</span>
                                              <strong className="text-rose-600 font-bold">{sty.fail}</strong>
                                            </div>
                                            <div className="flex items-center gap-1 font-mono text-[11px]">
                                              <span className="text-slate-400 font-bold">Total:</span>
                                              <strong className="text-slate-700 font-bold">{sty.total}</strong>
                                            </div>

                                            {/* Stylized quality band rating badge */}
                                            <span className={`px-2 py-1 rounded-md text-[10px] font-black uppercase font-mono tracking-wide ${
                                              Number(sty.passPercent) >= 95 
                                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-150'
                                                : Number(sty.passPercent) >= 85
                                                  ? 'bg-indigo-50 text-indigo-700 border border-indigo-150'
                                                  : 'bg-rose-50 text-rose-700 border border-rose-150'
                                            }`}>
                                              {sty.passPercent}% OK
                                            </span>
                                          </div>

                                        </div>
                                      );
                                    })
                                  )}
                                </div>
                              )}

                            </div>
                          );
                        })
                      )}
                    </div>
                  )}

                </div>
              );
            })
          )}
        </div>

      </div>
    );
  }

  // Render CUSTOM Total Quality & Severity Analysis (C4) - A1 - A6 Interactive Ledger
  if (id === 'C4') {
    return (
      <div className="space-y-6 animate-fade-in" id="quality-severity-dashboard">
        
        {/* HEADER BLOCK WITH PDF DOWNLOAD */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b pb-4 border-slate-100">
          <div>
            <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight flex items-center gap-2">
              <Icon name="shield-alert" size={20} className="text-rose-600 animate-pulse" />
              Total Quality & Severity Analysis
            </h2>
            <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">
              Cross-Module Non-Compliance ledger compiled from submodules A1 to A6
            </p>
          </div>
          <button
            onClick={downloadQualityAnalysisPDF}
            className="bg-rose-600 hover:bg-rose-700 text-white font-black text-xs uppercase px-4 py-2.5 rounded-xl flex items-center gap-2 transition duration-200 shadow-md shadow-rose-100 self-start sm:self-center cursor-pointer select-none"
          >
            <Icon name="download" size={14} />
            Export Severity Report
          </button>
        </div>

        {/* SUMMARY STATS GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" id="quality-kpi-cards">
          {/* CRITICAL */}
          <div className="p-4 bg-red-50/40 rounded-2xl border border-red-200/60 shadow-xs flex flex-col justify-between hover:border-red-300 transition duration-150">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black text-red-600 uppercase tracking-widest block">Critical Severity</span>
                <span className="p-1 text-red-600 bg-red-50 rounded-lg animate-pulse">
                  <Icon name="shield-alert" size={14} />
                </span>
              </div>
              <p className="text-3xl font-black text-red-600 mt-2 font-mono">{criticalStatistics.critical}</p>
            </div>
            <p className="text-[10px] text-red-500 font-extrabold mt-3 uppercase tracking-wider flex items-center gap-1.5">
              ● Stop Shipment / Re-Inspect Gate
            </p>
          </div>

          {/* MAJOR */}
          <div className="p-4 bg-amber-50/40 rounded-2xl border border-amber-200/60 shadow-xs flex flex-col justify-between hover:border-amber-300 transition duration-150">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black text-amber-600 uppercase tracking-widest block">Major Severity</span>
                <span className="p-1 text-amber-600 bg-amber-50 rounded-lg">
                  <Icon name="alert-triangle" size={14} />
                </span>
              </div>
              <p className="text-3xl font-black text-amber-500 mt-2 font-mono">{criticalStatistics.major}</p>
            </div>
            <p className="text-[10px] text-amber-600 font-extrabold mt-3 uppercase tracking-wider flex items-center gap-1.5">
              ▲ Rework Roving Needed
            </p>
          </div>

          {/* MINOR */}
          <div className="p-4 bg-blue-50/40 rounded-2xl border border-blue-200/60 shadow-xs flex flex-col justify-between hover:border-blue-300 transition duration-150">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest block">Minor Monitoring</span>
                <span className="p-1 text-blue-600 bg-blue-50 rounded-lg">
                  <Icon name="info" size={14} />
                </span>
              </div>
              <p className="text-3xl font-black text-blue-500 mt-2 font-mono">{criticalStatistics.minor}</p>
            </div>
            <p className="text-[10px] text-blue-500 font-extrabold mt-3 uppercase tracking-wider flex items-center gap-1.5">
              ■ Standard Sewing Deviations
            </p>
          </div>

          {/* TOTAL */}
          <div className="p-4 bg-slate-50/50 rounded-2xl border border-slate-200/60 shadow-xs flex flex-col justify-between hover:border-slate-300 transition duration-150">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block">Total Issues Logged</span>
                <span className="p-1 text-slate-500 bg-slate-100 rounded-lg">
                  <Icon name="list" size={14} />
                </span>
              </div>
              <p className="text-3xl font-black text-slate-800 mt-2 font-mono">{criticalStatistics.total}</p>
            </div>
            <p className="text-[10px] text-slate-500 font-extrabold mt-3 uppercase tracking-wider flex items-center gap-1.5">
              ★ Active Ledger Volume
            </p>
          </div>
        </div>

        {/* SEARCH AND DATE FILTERS */}
        <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200/60 shadow-xs space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="space-y-1.5" id="c3-search-input">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block">Search Style Reference / Failure Text</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                  <Icon name="search" size={14} />
                </span>
                <input
                  type="text"
                  placeholder="Type style, workorder, or remarks keyword..."
                  className="w-full bg-white border border-slate-200 focus:border-rose-500 rounded-xl py-2 pl-9 pr-4 text-xs font-bold outline-none transition placeholder-slate-350"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            {/* Quick Date Selector Dropdown */}
            <div className="space-y-1.5 block" id="c3-quick-date">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block">Quick Select Date</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                  <Icon name="calendar" size={14} />
                </span>
                <SearchableSelect
                  className="w-full bg-white border border-slate-200 focus:border-rose-500 rounded-xl py-2 pl-9 pr-4 text-xs font-bold outline-none transition appearance-none cursor-pointer"
                  value={selectedDate}
                  onChange={e => setSelectedDate(e.target.value)}
                >
                  <option value="">All Historic Logs Combined</option>
                  {availableDates.map(date => (
                    <option key={date} value={date}>
                      {new Date(date).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </option>
                  ))}
                </SearchableSelect>
              </div>
            </div>

            {/* Custom Date Input */}
            <div className="space-y-1.5" id="c3-custom-date">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block">Select Custom Date</label>
              <input
                type="date"
                className="w-full bg-white border border-slate-200 focus:border-rose-500 rounded-xl py-2 px-3 text-xs font-bold outline-none transition uppercase"
                value={selectedDate}
                onChange={e => setSelectedDate(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* WORKSPACE & MODULE BREAKDOWN SUMMARY PANELS */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* TARGET SYSTEM SEVERITY DISTRIBUTION */}
          <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl shadow-xs p-5 space-y-4">
            <div>
              <h3 className="text-sm font-black text-slate-800 uppercase tracking-wide flex items-center gap-2">
                <Icon name="activity" size={16} className="text-rose-600" />
                A1 - A6 Quality Issue Distribution
              </h3>
              <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                Relative volume and critical ratio of defects recorded across each system station
              </p>
            </div>

            <div className="space-y-4 pt-2">
              {moduleBreakdown.map(mod => {
                const totalMod = mod.count;
                const criticalWidth = totalMod > 0 ? (mod.critical / totalMod) * 100 : 0;
                const majorWidth = totalMod > 0 ? (mod.major / totalMod) * 100 : 0;
                const minorWidth = totalMod > 0 ? (mod.minor / totalMod) * 100 : 0;

                return (
                  <div key={mod.name} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span className="text-slate-700 font-extrabold uppercase tracking-tight">{mod.name}</span>
                      <span className="font-mono text-[11px] bg-slate-50 px-2 py-0.5 rounded border border-slate-150 text-slate-600 font-bold">
                        {totalMod} {totalMod === 1 ? 'Issue' : 'Issues'} Raised
                      </span>
                    </div>
                    {totalMod > 0 ? (
                      <div>
                        {/* Fluid segmented status bar */}
                        <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden flex shadow-inner">
                          {mod.critical > 0 && <div className="bg-red-500 h-full" style={{ width: `${criticalWidth}%` }} title={`Critical defects: ${mod.critical}`} />}
                          {mod.major > 0 && <div className="bg-amber-500 h-full" style={{ width: `${majorWidth}%` }} title={`Major defects: ${mod.major}`} />}
                          {mod.minor > 0 && <div className="bg-blue-500 h-full" style={{ width: `${minorWidth}%` }} title={`Minor deviations: ${mod.minor}`} />}
                        </div>
                        <div className="flex items-center gap-4 text-[9px] font-black uppercase text-slate-400 tracking-wider pt-1 font-mono">
                          {mod.critical > 0 && <span className="text-red-500">● {mod.critical} Critical</span>}
                          {mod.major > 0 && <span className="text-amber-500">▲ {mod.major} Major</span>}
                          {mod.minor > 0 && <span className="text-blue-500">■ {mod.minor} Minor</span>}
                        </div>
                      </div>
                    ) : (
                      <div className="h-4 bg-slate-50 rounded-md border border-dashed border-slate-150 flex items-center justify-center">
                        <span className="text-[9px] text-slate-400 font-black uppercase tracking-widest">✔ Zero non-compliance entries</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* DYNAMIC SHADOW ACTIONS PANEL */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xs p-5 text-white flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-red-650 bg-red-600 text-white rounded-xl">
                  <Icon name="settings" size={16} className="animate-spin-slow" />
                </div>
                <div>
                  <h3 className="text-xs font-black uppercase tracking-widest text-[#E2E8F0]">TROUBLESHOOTING ACTIONS</h3>
                  <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">CRITICALITY MATRIX ACTIONS</p>
                </div>
              </div>

              <div className="space-y-4 pt-2">
                {/* Check Critical issues volume */}
                {criticalStatistics.critical > 0 ? (
                  <div className="bg-red-950/40 border border-red-900/60 p-3.5 rounded-xl space-y-2">
                    <span className="inline-block px-1.5 py-0.5 bg-red-600 text-white text-[9px] font-black uppercase tracking-wider rounded font-mono">
                      IMMEDIATE ACTION PRE-SHIP
                    </span>
                    <p className="text-[11px] font-medium leading-relaxed text-red-200">
                      Hold current styles showing critical blocks under A5 (AQL) and A6 (Final Audit). Recalibrate laying knives, check wire caps on wings, and run sample pull tests immediately on Sew line.
                    </p>
                  </div>
                ) : (
                  <div className="bg-slate-800/40 border border-slate-700/50 p-3.5 rounded-xl space-y-2">
                    <p className="text-[11px] font-medium leading-relaxed text-emerald-400">
                      ✔ No critical ship blocks active. Maintain hourly inspection roving rounds to protect stable shipment margins.
                    </p>
                  </div>
                )}

                {/* Check Major issues volume */}
                {criticalStatistics.major > 0 ? (
                  <div className="bg-amber-950/40 border border-amber-900/60 p-3.5 rounded-xl space-y-2">
                    <span className="inline-block px-1.5 py-0.5 bg-amber-500 text-slate-900 text-[9px] font-black uppercase tracking-wider rounded font-mono">
                      PROCESS REWORK CORRECTION
                    </span>
                    <p className="text-[11px] font-medium leading-relaxed text-amber-200">
                      Material Inspection or Layer Cutting show minor deviations. Issue a vendor quality request on elastic stretch and inspect cutting lay thickness.
                    </p>
                  </div>
                ) : null}

                {criticalStatistics.total === 0 ? (
                  <p className="text-center text-xs text-slate-500 italic py-10">
                    All compliance parameters normal. No actions suggested.
                  </p>
                ) : null}
              </div>
            </div>

            <div className="h-px bg-slate-800 my-4" />
            <div className="text-[9px] text-slate-500 font-black uppercase tracking-widest text-center select-none">
              BQOS ACTION MODULE • CONFIDENTIAL
            </div>
          </div>
        </div>

        {/* COMPREHENSIVE INTERACTIVE TABLE LEDGER */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
          <div className="p-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-black text-slate-800 tracking-tight uppercase text-xs flex items-center gap-2">
              <Icon name="list" size={14} className="text-rose-600" />
              NON-COMPLIANCE ISSUES LEDGER ({qualityIssuesData.length} records matching)
            </h3>
            <span className="text-[9px] font-black bg-slate-200 text-slate-605 px-2.5 py-1 rounded-md font-mono">
              SORTED BY SEVERITY
            </span>
          </div>

          <div className="overflow-x-auto">
            {qualityIssuesData.length === 0 ? (
              <div className="p-16 text-center space-y-3">
                <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 border border-slate-100 mx-auto">
                  <Icon name="check-circle" size={18} className="text-emerald-500" />
                </div>
                <div className="space-y-1">
                  <p className="font-extrabold text-slate-700 text-sm uppercase tracking-wide">Excellent Quality Standing</p>
                  <p className="text-xs text-slate-450">No quality issues raised or logged found for specified filters.</p>
                </div>
              </div>
            ) : (
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-150 text-[10px] font-black text-slate-400 uppercase tracking-widest font-mono">
                    <th className="py-3 px-4">Criticity</th>
                    <th className="py-3 px-4">Log Date</th>
                    <th className="py-3 px-4">Source Submodule</th>
                    <th className="py-3 px-4">Style / Target</th>
                    <th className="py-3 px-4 w-1/3">Issue & Non-Compliance Details</th>
                    <th className="py-3 px-4">Audit Zone Node</th>
                    <th className="py-3 px-4">Inspector</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {qualityIssuesData.map((iss) => (
                    <tr key={iss.id} className="hover:bg-slate-50/50 transition">
                      {/* Criticity Pill */}
                      <td className="py-3 px-4">
                        {iss.severity === 'CRITICAL' ? (
                          <span className="px-2 py-0.5 bg-rose-50 text-rose-600 font-black rounded text-[9px] uppercase tracking-wider border border-rose-150 inline-flex items-center gap-1 animate-pulse">
                            <span className="w-1 h-1 bg-rose-600 rounded-full" />
                            CRITICAL
                          </span>
                        ) : iss.severity === 'MAJOR' ? (
                          <span className="px-2 py-0.5 bg-amber-50 text-amber-700 font-extrabold rounded text-[9px] uppercase tracking-wider border border-amber-150 inline-flex items-center gap-1">
                            <span className="w-1 h-1 bg-amber-500 rounded-full" />
                            MAJOR
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 bg-blue-50 text-blue-600 font-extrabold rounded text-[9px] uppercase tracking-wider border border-blue-150 inline-flex items-center gap-1">
                            MINOR
                          </span>
                        )}
                      </td>

                      {/* Log Date */}
                      <td className="py-3 px-4 font-mono font-bold text-slate-500">
                        {iss.checkingDate}
                      </td>

                      {/* Source Module */}
                      <td className="py-3 px-4">
                        <span className="bg-indigo-50/65 text-indigo-700 px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider border border-indigo-100">
                          {iss.module}: {iss.moduleName}
                        </span>
                      </td>

                      {/* Style Ref */}
                      <td className="py-3 px-4 font-black font-mono text-slate-800 uppercase">
                        {iss.style}
                      </td>

                      {/* Issue details / description */}
                      <td className="py-3 px-4 text-slate-600 font-medium leading-relaxed">
                        {iss.description}
                      </td>

                      {/* Zone Node */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1 text-slate-500 font-bold uppercase text-[10px]">
                          <Icon name="map-pin" size={10} className="text-slate-400" />
                          {iss.zone}
                        </div>
                      </td>

                      {/* Inspector */}
                      <td className="py-3 px-4 font-medium text-slate-550 uppercase">
                        {iss.inspector}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Render CUSTOM Workorder Defect Lookup & Analysis (C3)
  if (id === 'C3') {
    const activeWOData = workorderAnalysisData;

    // Local PDF Downloader for specific workorder
    const downloadWorkorderReportPDF = () => {
      if (!activeWOData) return;
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      // Accent line
      doc.setFillColor(239, 68, 68); // Red Accent
      doc.rect(15, 15, 180, 2, 'F');

      // Title
      doc.setFont("Helvetica", "bold");
      doc.setFontSize(15);
      doc.setTextColor(15, 23, 42); // slate 900
      doc.text(`WORKORDER QUALITY DOSSIER: ${activeWOData.workorderNumber}`, 15, 24);

      // Subtitle
      doc.setFont("Helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(100, 116, 139); // slate 500
      doc.text(`BQOS WORKORDER QUALITY TRACING AND DEFECT RECONCILIATION REPORT`, 15, 28);

      // Metadata Box
      doc.setDrawColor(226, 232, 240);
      doc.rect(15, 32, 180, 25);

      doc.setFont("Helvetica", "bold");
      doc.setFontSize(8);
      doc.setTextColor(51, 65, 85);
      doc.text(`Workorder No:`, 18, 38);
      doc.text(`Styles Associated:`, 18, 44);
      doc.text(`Date Exported:`, 18, 50);

      doc.setFont("Helvetica", "normal");
      doc.text(activeWOData.workorderNumber, 48, 38);
      doc.text(activeWOData.styles.join(", ") || 'N/A', 48, 44);
      doc.text(new Date().toLocaleString(), 48, 50);

      doc.setFont("Helvetica", "bold");
      doc.text(`Total Checked:`, 120, 38);
      doc.text(`Total Defects:`, 120, 44);
      doc.text(`Overall Defect Rate:`, 120, 50);

      doc.setFont("Helvetica", "normal");
      doc.text(`${activeWOData.totalChecked} pcs`, 150, 38);
      doc.text(`${activeWOData.totalDefects} defects (Rework: ${activeWOData.totalRework}, Fail: ${activeWOData.totalFail})`, 150, 44);
      
      const rateText = activeWOData.defectRate + "%";
      doc.text(rateText, 150, 50);

      // Defect Ledger Table
      const headers = [['STAGE', 'DATE', 'UNIT', 'INSPECTOR', 'DEFECT TYPE & REMARKS', 'REWORK', 'FAIL', 'SEVERITY']];
      const data = activeWOData.records.map(r => [
        r.stage,
        r.date,
        r.unit,
        r.inspector,
        r.remarks,
        r.reworkQty,
        r.failQty,
        r.severity
      ]);

      doc.text("HISTORIC DEFECT & NON-COMPLIANCE RECORDS", 15, 66);
      doc.rect(15, 68, 180, 0.5, 'F');

      autoTable(doc, {
        head: headers,
        body: data,
        startY: 72,
        margin: { left: 15, right: 15 },
        theme: 'striped',
        styles: {
          fontSize: 7.5,
          font: 'Helvetica',
          cellPadding: 2
        },
        headStyles: {
          fillColor: [15, 23, 42],
          textColor: [255, 255, 255],
          fontStyle: 'bold'
        },
        columnStyles: {
          4: { cellWidth: 50 } // Remarks column takes more width
        }
      });

      doc.save(`BQOS_Workorder_Defects_${activeWOData.workorderNumber}.pdf`);
    };

    const filteredSuggestions = filteredWorkordersList;

    return (
      <div className="space-y-6 animate-fade-in" id="workorder-investigation-dashboard">
        {/* HEADER BLOCK */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b pb-4 border-slate-100">
          <div>
            <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight flex items-center gap-2">
              <Icon name="search" size={20} className="text-indigo-600" />
              Workorder Quality Investigation Portal
            </h2>
            <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">
              Trace checking results, defect timelines, and inspector remarks by workorder number
            </p>
          </div>
          {activeWOData && (
            <button
              onClick={downloadWorkorderReportPDF}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs uppercase px-4 py-2.5 rounded-xl flex items-center gap-2 transition duration-200 shadow-md shadow-indigo-100 cursor-pointer select-none"
            >
              <Icon name="download" size={14} />
              Export Workorder Quality Report
            </button>
          )}
        </div>

        {/* MAIN SPLIT GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* LEFT PANEL - SEARCH & LIST (cols-4) */}
          <div className="lg:col-span-4 space-y-4">
            
            {/* SEARCH BOX */}
            <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Search Input</span>
              <div className="relative">
                <input
                  type="text"
                  value={workorderSearchInput}
                  onChange={(e) => {
                    const val = e.target.value;
                    setWorkorderSearchInput(val);
                    // If matches exactly one in suggestions, select it automatically
                    const matching = workordersWithDefectSummary.find(w => w.wo.toUpperCase() === val.trim().toUpperCase());
                    if (matching) {
                      setSelectedWorkorderId(matching.wo);
                    }
                  }}
                  placeholder="Type Workorder No. (e.g. WO-001)"
                  className="w-full bg-slate-50 border-2 border-slate-100 hover:border-slate-200 focus:border-indigo-500 rounded-xl px-4 py-3 text-xs font-bold text-slate-800 placeholder-slate-400 transition duration-150 outline-hidden pl-10"
                />
                <div className="absolute left-3.5 top-3.5 text-slate-400">
                  <Icon name="search" size={14} />
                </div>
                {workorderSearchInput && (
                  <button
                    onClick={() => {
                      setWorkorderSearchInput('');
                      setSelectedWorkorderId('');
                    }}
                    className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-600"
                  >
                    <Icon name="x" size={14} />
                  </button>
                )}
              </div>
            </div>

            {/* LIST OF ACTIVE WORKORDERS */}
            <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs space-y-3">
              <div className="flex items-center justify-between border-b pb-2 border-slate-50">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Active Workorders ({filteredSuggestions.length})</span>
                <span className="text-[9px] text-slate-300 font-bold uppercase">Sorted by Defect Count</span>
              </div>
              
              <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
                {filteredSuggestions.length === 0 ? (
                  <div className="text-center py-8 text-slate-300 font-bold text-xs">
                    No matching workorders found
                  </div>
                ) : (
                  filteredSuggestions.map((w) => {
                    const isSelected = selectedWorkorderId === w.wo;
                    return (
                      <div
                        key={w.wo}
                        onClick={() => {
                          setSelectedWorkorderId(w.wo);
                          setWorkorderSearchInput(w.wo);
                        }}
                        className={`p-3 rounded-xl border-2 transition duration-150 cursor-pointer ${
                          isSelected
                            ? 'border-indigo-500 bg-indigo-50/20'
                            : 'border-slate-50 bg-slate-50/40 hover:border-slate-100 hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-black text-slate-800 uppercase tracking-tight">{w.wo}</span>
                          <span className="text-[10px] font-black text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md">
                            {w.totalDefects} Defects
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-400 font-bold mt-1 truncate">
                          Style: {w.styles.join(", ") || 'N/A'}
                        </p>
                        <div className="flex flex-wrap gap-1 mt-1.5">
                          {w.stages.map(st => (
                            <span key={st} className="text-[8px] font-black text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded-sm uppercase">
                              {st}
                            </span>
                          ))}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          {/* RIGHT PANEL - DETAILED DOSSIER OR EMPTY STATE (cols-8) */}
          <div className="lg:col-span-8">
            {!activeWOData ? (
              <div className="bg-white border border-slate-100 rounded-3xl p-12 text-center flex flex-col items-center justify-center min-h-[500px] shadow-xs">
                <div className="p-4 bg-indigo-50 rounded-full text-indigo-500 mb-4 animate-bounce">
                  <Icon name="search" size={32} />
                </div>
                <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight">Trace Defects By Workorder</h3>
                <p className="text-slate-400 text-xs mt-2 max-w-sm mx-auto font-medium leading-relaxed">
                  Enter a workorder code in the search field or click one of the active workorders in the left sidebar to analyze its full quality trace and inspection results.
                </p>
                
                {/* Visual Quick Links */}
                {workordersWithDefectSummary.length > 0 && (
                  <div className="mt-8 w-full max-w-md">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-3 text-center">Quick Jump Options</span>
                    <div className="flex flex-wrap justify-center gap-2">
                      {workordersWithDefectSummary.slice(0, 4).map(w => (
                        <button
                          key={w.wo}
                          onClick={() => {
                            setSelectedWorkorderId(w.wo);
                            setWorkorderSearchInput(w.wo);
                          }}
                          className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-150 rounded-lg text-[10px] font-bold text-slate-600 transition"
                        >
                          {w.wo} ({w.totalDefects} defects)
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-6">
                
                {/* SUMMARY HEADER DOSSIER */}
                <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xs">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b pb-4 border-slate-50 mb-6">
                    <div>
                      <span className="text-[9px] font-black text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-md uppercase tracking-wider">
                        Active Selection Tracing
                      </span>
                      <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight mt-2 flex items-center gap-2">
                        Workorder: {activeWOData.workorderNumber}
                      </h3>
                      <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">
                        Styles: {activeWOData.styles.join(", ") || 'N/A'}
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        setSelectedWorkorderId('');
                        setWorkorderSearchInput('');
                      }}
                      className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-xs uppercase rounded-xl transition duration-150 flex items-center gap-1.5 self-start animate-fade-in"
                    >
                      <Icon name="arrow-left" size={12} />
                      Back to Directory
                    </button>
                  </div>

                  {/* MINI KPI ROW */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-slate-50/50 p-4 rounded-2xl border border-slate-100 text-center">
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Total Checked</span>
                      <p className="text-2xl font-black text-slate-800 mt-1 font-mono">{activeWOData.totalChecked}</p>
                      <span className="text-[8px] text-slate-400 font-bold uppercase">Pieces Checked</span>
                    </div>

                    <div className="bg-amber-50/30 p-4 rounded-2xl border border-amber-100/60 text-center">
                      <span className="text-[9px] font-black text-amber-600 uppercase tracking-widest">Rework Count</span>
                      <p className="text-2xl font-black text-amber-600 mt-1 font-mono">{activeWOData.totalRework}</p>
                      <span className="text-[8px] text-amber-500 font-bold uppercase">Minor/Major Defects</span>
                    </div>

                    <div className="bg-rose-50/30 p-4 rounded-2xl border border-rose-100/60 text-center">
                      <span className="text-[9px] font-black text-rose-600 uppercase tracking-widest">Fails / Rejects</span>
                      <p className="text-2xl font-black text-rose-600 mt-1 font-mono">{activeWOData.totalFail}</p>
                      <span className="text-[8px] text-rose-500 font-bold uppercase">Critical Failures</span>
                    </div>

                    <div className={`p-4 rounded-2xl border text-center ${
                      activeWOData.defectRate > 10
                        ? 'bg-red-50/20 border-red-100 text-red-700'
                        : activeWOData.defectRate > 5
                          ? 'bg-amber-50/20 border-amber-100 text-amber-700'
                          : 'bg-emerald-50/20 border-emerald-100 text-emerald-700'
                    }`}>
                      <span className="text-[9px] font-black uppercase tracking-widest opacity-80">Defect Rate</span>
                      <p className="text-2xl font-black mt-1 font-mono">{activeWOData.defectRate}%</p>
                      <span className="text-[8px] font-bold uppercase">
                        {activeWOData.defectRate > 10 ? 'High Defect Load' : activeWOData.defectRate > 5 ? 'Moderate Load' : 'Excellent Quality'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* STAGE-WISE QUALITY FLOWTIMELINE */}
                <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xs space-y-4">
                  <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider border-b pb-2 border-slate-50">
                    Production Process Trace & Stage Statuses
                  </h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                    {[
                      { key: 'Cutting', label: 'Cutting Quality', color: 'bg-blue-500', icon: 'scissors', modId: 'A2' },
                      { key: 'Inline', label: 'Sewing Inline', color: 'bg-cyan-500', icon: 'cable', modId: 'A3' },
                      { key: 'Endline', label: 'Sewing Endline', color: 'bg-emerald-500', icon: 'clipboard-list', modId: 'A4' },
                      { key: 'AQL', label: 'AQL Inspection', color: 'bg-amber-500', icon: 'shield-check', modId: 'A5' },
                      { key: 'Final Audit', label: 'Final Audit Gate', color: 'bg-rose-500', icon: 'ship', modId: 'A6' }
                    ].map((stage, sIdx) => {
                      // Find records for this stage
                      const stageRecords = activeWOData.records.filter(r => r.stage.toLowerCase().includes(stage.key.toLowerCase()));
                      const hasChecks = stageRecords.length > 0 || 
                        (stage.key === 'Cutting' && allSubmodulesData.cutting.some((r: any) => String(r.wo || '').toUpperCase() === activeWOData.workorderNumber)) ||
                        (stage.key === 'Inline' && allSubmodulesData.inline.some((r: any) => String(r.wo || '').toUpperCase() === activeWOData.workorderNumber)) ||
                        (stage.key === 'Endline' && allSubmodulesData.endline.some((r: any) => String(r.wo || '').toUpperCase() === activeWOData.workorderNumber)) ||
                        (stage.key === 'AQL' && allSubmodulesData.aql.some((r: any) => String(r.wo || '').toUpperCase() === activeWOData.workorderNumber)) ||
                        (stage.key === 'Final Audit' && allSubmodulesData.finalAudit.some((r: any) => String(r.wo || '').toUpperCase() === activeWOData.workorderNumber));
                      
                      const defectsInStage = stageRecords.reduce((acc, curr) => acc + curr.reworkQty + curr.failQty, 0);
                      const statusColor = !hasChecks 
                        ? 'border-slate-100 bg-slate-50 text-slate-300' 
                        : defectsInStage > 0 
                          ? 'border-rose-100 bg-rose-50/50 text-rose-600 animate-pulse' 
                          : 'border-emerald-100 bg-emerald-50 text-emerald-600';

                      return (
                        <div key={stage.key} className={`p-3 rounded-2xl border-2 text-center flex flex-col items-center justify-between ${statusColor}`}>
                          <span className="text-[8px] font-black uppercase tracking-widest text-slate-400 mb-1">Stage {sIdx + 1}</span>
                          <div className="p-2 bg-white rounded-full shadow-xs mb-1.5">
                            <Icon name={defectsInStage > 0 ? 'alert-triangle' : hasChecks ? 'check-circle-2' : 'info'} size={14} />
                          </div>
                          <span className="text-[9px] font-black text-slate-800 uppercase leading-none">{stage.label}</span>
                          <div className="mt-2">
                            {!hasChecks ? (
                              <span className="text-[8px] font-bold text-slate-300 uppercase">No Data</span>
                            ) : defectsInStage > 0 ? (
                              <span className="text-[8px] font-black text-rose-600 uppercase bg-rose-100 px-1.5 py-0.5 rounded">
                                {defectsInStage} Defects
                              </span>
                            ) : (
                              <span className="text-[8px] font-black text-emerald-600 uppercase bg-emerald-100 px-1.5 py-0.5 rounded">
                                PASS
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* DETAILED LEDGER TABLE FOR THIS WORKORDER */}
                <div className="bg-white rounded-3xl border border-slate-100 shadow-xs overflow-hidden">
                  <div className="p-5 border-b border-slate-50 flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">
                        Investigative Defect Record Logs
                      </h4>
                      <p className="text-[9px] text-slate-400 font-bold uppercase">
                        Ledger showing individual defect entries registered for workorder {activeWOData.workorderNumber}
                      </p>
                    </div>
                    <span className="text-[9px] font-black text-slate-400 bg-slate-50 px-2 py-1 rounded-md uppercase">
                      {activeWOData.records.length} Logs Found
                    </span>
                  </div>

                  {activeWOData.records.length === 0 ? (
                    <div className="text-center py-12 text-slate-400 font-bold text-xs bg-slate-50/20">
                      No defects registered in any stage for this workorder! Excellent quality standard.
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className="bg-slate-50 text-slate-400 text-[10px] font-extrabold uppercase border-b border-slate-100">
                            <th className="py-3 px-4">Stage</th>
                            <th className="py-3 px-4">Date</th>
                            <th className="py-3 px-4">Inspector</th>
                            <th className="py-3 px-4">Unit / Section</th>
                            <th className="py-3 px-4">Defect & Remarks</th>
                            <th className="py-3 px-4 text-center">Rework</th>
                            <th className="py-3 px-4 text-center">Fail</th>
                            <th className="py-3 px-4 text-center">Severity</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {activeWOData.records.map((r) => (
                            <tr key={r.id} className="hover:bg-slate-50/50 transition">
                              <td className="py-3 px-4 font-black text-slate-800 uppercase leading-none">{r.stage}</td>
                              <td className="py-3 px-4 text-slate-500 font-mono text-[10px] whitespace-nowrap">{r.date}</td>
                              <td className="py-3 px-4 text-slate-600 font-bold">{r.inspector}</td>
                              <td className="py-3 px-4 text-slate-500">{r.unit} {r.line !== 'N/A' ? `• Line ${r.line}` : ''}</td>
                              <td className="py-3 px-4">
                                <span className="text-slate-700 block font-medium leading-normal max-w-xs">{r.remarks}</span>
                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block mt-0.5">{r.defectType}</span>
                              </td>
                              <td className="py-3 px-4 text-center font-mono font-bold text-amber-600">{r.reworkQty}</td>
                              <td className="py-3 px-4 text-center font-mono font-bold text-red-600">{r.failQty}</td>
                              <td className="py-3 px-4 text-center">
                                <span className={`px-2 py-0.5 rounded-sm text-[8px] font-black uppercase ${
                                  r.severity === 'CRITICAL' 
                                    ? 'bg-red-100 text-red-700' 
                                    : r.severity === 'MAJOR' 
                                      ? 'bg-amber-100 text-amber-700' 
                                      : 'bg-slate-100 text-slate-700'
                                }`}>
                                  {r.severity}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (id === 'C6') {
    // If no worker matches the current search/selection, show directory view
    if (!currentWorkerData) {
      const q = searchQuery.toUpperCase().trim();
      const filteredWorkers = workerSummaryList.filter(w => {
        if (!q) return true;
        return w.name.toUpperCase().includes(q);
      });

      return (
        <div className="space-y-6 animate-fade-in" id="worker-directory-panel">
          {/* Header Block */}
          <div className="border-b pb-4 border-slate-100">
            <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight flex items-center gap-2">
              <Icon name="users" size={20} className="text-indigo-600 animate-pulse" />
              Worker & Operator Check Directory
            </h2>
            <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">
              System-wide operator audit profile registry & defect monitoring ledger
            </p>
          </div>

          {/* Search Operator Search Bar */}
          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200/60 shadow-xs flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="w-full md:max-w-xl space-y-1.5">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block">Look Up Operator / Worker name</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                  <Icon name="search" size={14} />
                </span>
                <input
                  type="text"
                  placeholder="Enter operator name (e.g. WORKER 1)..."
                  className="w-full bg-white border border-slate-200 focus:border-indigo-500 rounded-xl py-2.5 pl-9 pr-4 text-xs font-bold outline-none transition placeholder-slate-350"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            {searchQuery.trim() && (
              <button
                onClick={() => {
                  const firstMatch = filteredWorkers[0];
                  if (firstMatch) {
                    setSelectedWorker(firstMatch.name);
                    setSearchQuery('');
                  } else {
                    setSelectedWorker(searchQuery.trim().toUpperCase());
                    setSearchQuery('');
                  }
                }}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs uppercase px-5 py-2.5 rounded-xl flex items-center gap-2 transition cursor-pointer self-stretch md:self-end text-center justify-center shadow-md shadow-indigo-100"
              >
                <Icon name="user-check" size={14} />
                Analyze Specified Name
              </button>
            )}
          </div>

          {/* Directory Listings */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-black text-slate-800 uppercase tracking-tight text-xs flex items-center gap-1.5">
                <Icon name="list" size={14} className="text-slate-500" />
                Active Staff Registry ({filteredWorkers.length} matching operators)
              </h3>
              <span className="text-[9px] font-black uppercase text-slate-400 tracking-wider">
                Click on any card to view detailed defects history
              </span>
            </div>

            {filteredWorkers.length === 0 ? (
              <div className="bg-white border border-slate-200 p-16 text-center space-y-3 rounded-2xl">
                <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 border border-slate-100 mx-auto">
                  <Icon name="user-x" size={18} className="text-slate-400" />
                </div>
                <div className="space-y-1">
                  <p className="font-extrabold text-slate-700 text-sm uppercase tracking-wide">Operator Not Found</p>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    No operator matching "<strong>{searchQuery}</strong>" was identified in active checked logs.
                  </p>
                </div>
                <button
                  onClick={() => {
                    setSelectedWorker(searchQuery.trim().toUpperCase());
                    setSearchQuery('');
                  }}
                  className="bg-slate-900 text-white font-black text-xs uppercase px-4 py-2 mt-2 rounded-xl transition hover:bg-slate-800 cursor-pointer inline-flex items-center gap-1.5"
                >
                  Create Custom Profile for "{searchQuery.trim().toUpperCase()}"
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredWorkers.map(w => {
                  const totalIncidents = w.defects.length;
                  return (
                    <div
                      key={w.name}
                      onClick={() => {
                        setSelectedWorker(w.name);
                        setSearchQuery('');
                      }}
                      className="bg-white border border-slate-200 p-5 rounded-2xl shadow-xs hover:shadow-md hover:border-indigo-400 hover:-translate-y-0.5 transition duration-200 transform cursor-pointer group flex flex-col justify-between"
                    >
                      <div className="space-y-3">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center group-hover:bg-indigo-50 group-hover:text-indigo-600 transition">
                              <Icon name="user" size={16} />
                            </div>
                            <span className="font-extrabold text-slate-800 tracking-tight text-sm uppercase">{w.name}</span>
                          </div>
                          <span className={`px-2 py-0.5 text-[9px] font-black rounded-md border uppercase ${w.badgeColor}`}>
                            Grade {w.grade}
                          </span>
                        </div>

                        <div className="h-px bg-slate-100" />

                        {/* Metrics Panel */}
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div>
                            <span className="text-[10px] uppercase font-black text-slate-40 tracking-wider text-slate-405">Checked pieces</span>
                            <p className="font-mono font-black text-slate-800 mt-0.5">{w.totalChecked} Checked</p>
                          </div>
                          <div>
                            <span className="text-[10px] uppercase font-black text-slate-400 tracking-wider">Defect pieces</span>
                            <p className={`font-mono font-black mt-0.5 ${totalIncidents > 0 ? 'text-rose-600' : 'text-slate-600'}`}>
                              {w.totalDefects} Defects
                            </p>
                          </div>
                        </div>

                        {/* Defect Rate Progress */}
                        <div className="space-y-1">
                          <div className="flex justify-between items-center text-[10px] font-bold">
                            <span className="text-slate-400 uppercase tracking-wide">Incidence Rate</span>
                            <span className={w.defectRate >= 10 ? 'text-rose-600 font-black' : 'text-slate-600 font-semibold font-mono'}>
                              {w.defectRate}%
                            </span>
                          </div>
                          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${w.defectRate >= 10 ? 'bg-rose-500' : w.defectRate >= 6 ? 'bg-amber-500' : w.defectRate >= 3 ? 'bg-yellow-400' : 'bg-emerald-500'}`}
                              style={{ width: `${Math.min(100, w.defectRate * 3)}%` }}
                            />
                          </div>
                        </div>
                      </div>

                      <div className="mt-4 flex items-center justify-between text-[10px] font-black uppercase text-indigo-600 tracking-wider group-hover:text-indigo-700">
                        <span>Check all defects</span>
                        <Icon name="chevron-right" size={14} className="group-hover:translate-x-0.5 transitionTransform" />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      );
    }

    // Otherwise, show the Deep Dive custom detail profile for the selected operator!
    if (!currentWorkerData) {
      return (
        <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 space-y-4 animate-fade-in">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Creating custom active profile for "{selectedWorker}"...</p>
          <button onClick={() => setSelectedWorker('')} className="bg-slate-900 text-white font-extrabold text-xs uppercase px-4 py-2 rounded-xl transition hover:bg-slate-800 cursor-pointer">
            Cancel
          </button>
        </div>
      );
    }

    // Aggregate statistics for selected operator's defects
    const defectCounts = currentWorkerData.defects.reduce((acc: Record<string, number>, curr) => {
      acc[curr.defectType] = (acc[curr.defectType] || 0) + curr.qty;
      return acc;
    }, {});
    
    const defectBreakdownList: { name: string; count: number }[] = Object.entries(defectCounts)
      .map(([name, count]) => ({ name, count: count as number }))
      .sort((a, b) => b.count - a.count);

    const operationCounts = currentWorkerData.defects.reduce((acc: Record<string, number>, curr) => {
      acc[curr.operation] = (acc[curr.operation] || 0) + curr.qty;
      return acc;
    }, {});

    const operationBreakdownList: { name: string; count: number }[] = Object.entries(operationCounts)
      .map(([name, count]) => ({ name, count: count as number }))
      .sort((a, b) => b.count - a.count);

    // Apply ledger filters on individual operator defects:
    const filteredIncidents = currentWorkerData.defects.filter(iss => {
      // Zone Filter
      if (globalZone && globalZone !== 'ALL' && iss.zone.toUpperCase() !== globalZone.toUpperCase()) return false;
      // Date Filter
      if (selectedDate && iss.date !== selectedDate) return false;
      // Search Box Filter
      if (searchQuery.trim()) {
        const q = searchQuery.toUpperCase().trim();
        return iss.style.includes(q) || iss.defectType.includes(q) || iss.remarks.toUpperCase().includes(q) || iss.operation.includes(q);
      }
      return true;
    });

    return (
      <div className="space-y-6 animate-fade-in" id="worker-profile-deepdive">
        
        {/* BACK / HEADER ACTION BAR */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b pb-4 border-slate-100">
          <div className="space-y-1">
            <button
              onClick={() => {
                setSelectedWorker('');
                setSearchQuery('');
              }}
              className="flex items-center gap-1.5 text-[10px] text-slate-405 text-slate-400 hover:text-indigo-600 font-black uppercase tracking-widest transition cursor-pointer select-none"
            >
              <Icon name="arrow-left" size={12} />
              Return to Operator Directory
            </button>
            <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight flex items-center gap-2">
              <Icon name="user-check" size={20} className="text-rose-600" />
              Operator check: {currentWorkerData.name}
            </h2>
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Granular quality ledger & sewing compliance ledger for this operator
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setSelectedWorker('');
                setSearchQuery('');
              }}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-xs uppercase rounded-xl transition cursor-pointer select-none"
            >
              Switch Operator
            </button>
            <button
              onClick={downloadWorkerReportPDF}
              className="bg-slate-950 hover:bg-slate-900 text-white font-black text-xs uppercase px-4 py-2.5 rounded-xl flex items-center gap-2 transition duration-200 shadow-md cursor-pointer select-none"
            >
              <Icon name="download" size={14} />
              Export Operator Dossier
            </button>
          </div>
        </div>

        {/* WORKER SUMMARY CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* TOTAL CHECKED PIECES */}
          <div className="p-4 bg-slate-50/50 rounded-2xl border border-slate-200/60 shadow-xs hover:border-slate-300 transition flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Logged Checked Pieces</span>
                <span className="p-1 text-slate-500 bg-slate-100 rounded-lg">
                  <Icon name="package" size={14} />
                </span>
              </div>
              <p className="text-3xl font-black text-slate-800 mt-2 font-mono">{currentWorkerData.totalChecked}</p>
            </div>
            <p className="text-[10px] text-slate-500 font-extrabold mt-3 uppercase tracking-wider">
              ★ Accumulated Inpsected lots
            </p>
          </div>

          {/* TOTAL DEFECT FLAGGED */}
          <div className="p-4 bg-rose-50/20 rounded-2xl border border-rose-200/40 shadow-xs hover:border-rose-200 transition flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black text-rose-600 uppercase tracking-widest block">Defect Parts Flagged</span>
                <span className="p-1 text-rose-600 bg-rose-50 rounded-lg">
                  <Icon name="frown" size={14} />
                </span>
              </div>
              <p className="text-3xl font-black text-rose-600 mt-2 font-mono">{currentWorkerData.totalDefects}</p>
            </div>
            <p className={`text-[10px] font-extrabold mt-3 uppercase tracking-wider ${currentWorkerData.totalDefects > 0 ? 'text-rose-500' : 'text-slate-400'}`}>
              ● Failed sewing inspect gate
            </p>
          </div>

          {/* QUALITY DEFECT RANGE */}
          <div className="p-4 bg-slate-50/50 rounded-2xl border border-slate-200/60 shadow-xs transition flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Incurred Defect Rate</span>
                <span className="p-1 text-slate-500 bg-slate-100 rounded-lg">
                  <Icon name="activity" size={14} />
                </span>
              </div>
              <p className={`text-3xl font-black mt-2 font-mono ${currentWorkerData.defectRate >= 10 ? 'text-rose-600' : currentWorkerData.defectRate >= 6 ? 'text-amber-500' : 'text-emerald-600'}`}>
                {currentWorkerData.defectRate}%
              </p>
            </div>
            <p className="text-[10px] text-slate-500 font-extrabold mt-3 uppercase tracking-wider">
              ■ Checked non-compliance ratio
            </p>
          </div>

          {/* STANDING GRADE */}
          <div className={`p-4 rounded-2xl border shadow-xs transition flex flex-col justify-between ${currentWorkerData.defectRate >= 10 ? 'bg-rose-50/50 border-rose-200/65' : 'bg-emerald-50/55 border-emerald-250/30'}`}>
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-widest block text-slate-500">Quality Band Standing</span>
                <span className={`p-1 rounded-lg ${currentWorkerData.defectRate >= 10 ? 'text-rose-600 bg-rose-100' : 'text-emerald-600 bg-emerald-100'}`}>
                  <Icon name="award" size={14} />
                </span>
              </div>
              <p className={`text-3xl font-black mt-2 ${currentWorkerData.defectRate >= 10 ? 'text-rose-600' : 'text-emerald-700'}`}>
                Grade {currentWorkerData.grade}
              </p>
            </div>
            <span className={`text-[10px] font-black uppercase tracking-wider ${currentWorkerData.defectRate >= 10 ? 'text-rose-550' : 'text-emerald-600'}`}>
              ◆ PERFORMANCE: {currentWorkerData.statusText}
            </span>
          </div>

        </div>

        {/* LEDGER FILTER CONTROLS */}
        <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200/60 shadow-xs space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            {/* Search filter purely for this worker */}
            <div className="space-y-1.5" id="worker-search-control">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block">Filter Defects / Style name</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                  <Icon name="search" size={14} />
                </span>
                <input
                  type="text"
                  placeholder="Seach style, operation, or remarks for this operator..."
                  className="w-full bg-white border border-slate-200 focus:border-indigo-500 rounded-xl py-2 pl-9 pr-4 text-xs font-bold outline-none transition placeholder-slate-350"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            {/* Quick date selector dropdown */}
            <div className="space-y-1.5" id="worker-quick-date-dropdown">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block font-sans">Quick Select Log Date</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                  <Icon name="calendar" size={14} />
                </span>
                <SearchableSelect
                  className="w-full bg-white border border-slate-200 focus:border-indigo-500 rounded-xl py-2 pl-9 pr-4 text-xs font-bold outline-none transition appearance-none cursor-pointer"
                  value={selectedDate}
                  onChange={e => setSelectedDate(e.target.value)}
                >
                  <option value="">All Logged Dates</option>
                  {availableDates.map(date => (
                    <option key={date} value={date}>
                      {new Date(date).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </option>
                  ))}
                </SearchableSelect>
              </div>
            </div>

            {/* Custom date selection input */}
            <div className="space-y-1.5" id="worker-custom-date-input">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block font-sans">Custom date limit</label>
              <input
                type="date"
                className="w-full bg-white border border-slate-200 focus:border-indigo-500 rounded-xl py-2 px-3 text-xs font-bold outline-none transition uppercase/60 uppercase"
                value={selectedDate}
                onChange={e => setSelectedDate(e.target.value)}
              />
            </div>

          </div>
        </div>

        {/* DEFECT ANALYSIS DETAILS */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* PARETO BREAKDOWN OF DEFECTS */}
          <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-xs space-y-4">
            <div>
              <h3 className="text-sm font-black text-slate-800 uppercase tracking-wide flex items-center gap-1.5">
                <Icon name="bar-chart" size={16} className="text-rose-500" />
                Defect Codes Hierarchy (Pareto Spread)
              </h3>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                Distribution of failure reasons recorded under this operator
              </p>
            </div>

            <div className="space-y-3 pt-2">
              {defectBreakdownList.length === 0 ? (
                <div className="py-10 text-center text-xs text-slate-400 italic">
                  ✔ Zero defects logged for this worker. Great standing!
                </div>
              ) : (
                defectBreakdownList.map(item => {
                  const percent = currentWorkerData.totalDefects > 0 ? (item.count / currentWorkerData.totalDefects) * 100 : 0;
                  return (
                    <div key={item.name} className="space-y-1">
                      <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                        <span className="uppercase font-extrabold tracking-tight">{item.name}</span>
                        <span className="font-mono text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded border border-slate-150 font-bold">
                          {item.count} {item.count === 1 ? 'failure' : 'failures'} ({percent.toFixed(0)}%)
                        </span>
                      </div>
                      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div className="h-full bg-rose-500 rounded-full" style={{ width: `${percent}%` }} />
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* PARETO BREAKDOWN OF AFFECTED SEWING OPERATIONS */}
          <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-xs space-y-4">
            <div>
              <h3 className="text-sm font-black text-slate-800 uppercase tracking-wide flex items-center gap-1.5">
                <Icon name="scissors" size={16} className="text-indigo-500" />
                Affected Sewing Operations
              </h3>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wide">
                Where the defects occurred during the sewing assembly rounds
              </p>
            </div>

            <div className="space-y-3 pt-2">
              {operationBreakdownList.length === 0 ? (
                <div className="py-10 text-center text-xs text-slate-400 italic">
                  ✔ No operations affected. Maintaining zero defects!
                </div>
              ) : (
                operationBreakdownList.map(item => {
                  const percent = currentWorkerData.totalDefects > 0 ? (item.count / currentWorkerData.totalDefects) * 100 : 0;
                  return (
                    <div key={item.name} className="space-y-1">
                      <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                        <span className="uppercase font-extrabold tracking-tight">{item.name}</span>
                        <span className="font-mono text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded border border-slate-150 font-bold">
                          {item.count} {item.count === 1 ? 'part' : 'parts'} ({percent.toFixed(0)}%)
                        </span>
                      </div>
                      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${percent}%` }} />
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

        </div>

        {/* COMPREHENSIVE INCIDENTS LEDGER TABLE */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
          <div className="p-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-black text-slate-800 tracking-tight uppercase text-xs flex items-center gap-2">
              <Icon name="list" size={14} className="text-rose-600" />
              NON-COMPLIANCE INCIDENTS LEDGER ({filteredIncidents.length} records matching)
            </h3>
            <span className="text-[9px] font-black bg-slate-200 text-slate-600 px-2.5 py-1 rounded-md font-mono font-extrabold">
              FILTERED VIEW
            </span>
          </div>

          <div className="overflow-x-auto">
            {filteredIncidents.length === 0 ? (
              <div className="p-16 text-center space-y-3">
                <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 border border-slate-100 mx-auto">
                  <Icon name="check-circle" size={18} className="text-emerald-500" />
                </div>
                <div className="space-y-1">
                  <p className="font-extrabold text-slate-700 text-sm uppercase tracking-wide">Excellent Standing</p>
                  <p className="text-xs text-slate-400">No active sewing defects found matching selected filter options.</p>
                </div>
              </div>
            ) : (
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-150 text-[10px] font-black text-slate-40 tracking-widest font-mono text-slate-500 uppercase">
                    <th className="py-3 px-4">Severity</th>
                    <th className="py-3 px-4">Log Date</th>
                    <th className="py-3 px-4">Incident Source</th>
                    <th className="py-3 px-4">Style Ref</th>
                    <th className="py-3 px-4 w-1/3">Defect type / Details</th>
                    <th className="py-3 px-4">Operation / Machine</th>
                    <th className="py-3 px-4">Zone / Unit</th>
                    <th className="py-3 px-4">Inspector</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredIncidents.map(iss => (
                    <tr key={iss.id} className="hover:bg-slate-50/50 transition">
                      
                      {/* Severity Pill */}
                      <td className="py-3 px-4">
                        {iss.severity === 'CRITICAL' ? (
                          <span className="px-2 py-0.5 bg-rose-50 text-rose-600 font-black rounded text-[9px] uppercase tracking-wider border border-rose-150 inline-flex items-center gap-1">
                            CRITICAL
                          </span>
                        ) : iss.severity === 'MAJOR' ? (
                          <span className="px-2 py-0.5 bg-amber-50 text-amber-700 font-extrabold rounded text-[9px] uppercase tracking-wider border border-amber-150 inline-flex items-center gap-1">
                            MAJOR
                          </span>
                        ) : iss.severity === 'PASS' ? (
                          <span className="px-2 py-0.5 bg-emerald-50 text-emerald-600 font-black rounded text-[9px] uppercase tracking-wider border border-emerald-150 inline-flex items-center gap-1">
                            COMPLIANT / PASS
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 bg-blue-50 text-blue-600 font-extrabold rounded text-[9px] uppercase tracking-wider border border-blue-150 inline-flex items-center gap-1">
                            MINOR
                          </span>
                        )}
                      </td>

                      {/* Log Date */}
                      <td className="py-3 px-4 font-mono font-bold text-slate-500">
                        {iss.date}
                      </td>

                      {/* Origin Source */}
                      <td className="py-3 px-4 font-bold uppercase text-[10px] text-slate-600">
                        {iss.source}
                      </td>

                      {/* Style Ref */}
                      <td className="py-3 px-4 font-black font-mono text-slate-800 uppercase">
                        {iss.style}
                      </td>

                      {/* Defect details */}
                      <td className="py-3 px-4 text-slate-605 font-medium leading-relaxed text-slate-600">
                        <span className="font-extrabold text-slate-800 uppercase block">{iss.defectType}</span>
                        {iss.remarks && (
                          <span className="text-[10px] text-slate-400 uppercase tracking-tight block mt-0.5">
                            Comment: {iss.remarks}
                          </span>
                        )}
                      </td>

                      {/* Operation & Machine */}
                      <td className="py-3 px-4">
                        <div className="font-extrabold uppercase font-sans text-slate-600">{iss.operation}</div>
                        <span className="text-[9px] font-mono text-slate-400 uppercase tracking-widest font-black">Mc: {iss.machine}</span>
                      </td>

                      {/* Zone/Unit */}
                      <td className="py-3 px-4 font-bold text-slate-500 uppercase text-[10px]">
                        {iss.zone} / {iss.unit}
                      </td>

                      {/* Inspector */}
                      <td className="py-3 px-4 font-medium text-slate-550 uppercase">
                        {iss.inspector}
                      </td>

                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

      </div>
    );
  }

  if (id === 'C5') {
    if (!factoryPerformanceData) {
      return (
        <div className="p-8 text-center text-slate-400 font-bold uppercase tracking-wider animate-fade-in">
          No Factory Performance Data available for this configuration.
        </div>
      );
    }

    const {
      availableUnits,
      availableDates,
      activeUnit,
      totalChecked,
      totalPassed,
      totalRework,
      totalRejection,
      styleSizewise
    } = factoryPerformanceData;

    // Calculate rates
    const reworkRate = totalChecked > 0 ? ((totalRework / totalChecked) * 100).toFixed(1) : '0.0';
    const rejectRate = totalChecked > 0 ? ((totalRejection / totalChecked) * 100).toFixed(1) : '0.0';
    const qualityYield = totalChecked > 0 ? ((totalPassed / totalChecked) * 100).toFixed(1) : '100.0';

    return (
      <div className="space-y-6 animate-fade-in" id="factory-performance-panel">
        
        {/* Header Block */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b pb-4 border-slate-100">
          <div className="space-y-1">
            <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight flex items-center gap-2">
              <Icon name="activity" size={20} className="text-indigo-600 animate-pulse" />
              Factory Performance Ledger
            </h2>
            <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">
              {globalZone === 'KERALA' ? 'Kerala Zone' : `${globalZone || 'All'} Zone`} • Unit-wise production yield, rework rates, & defect matrix
            </p>
          </div>

          {/* Date Selector Dropbox */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl shadow-xs">
              <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider">Select Date:</span>
              <SearchableSelect
                className="bg-transparent border-none text-xs font-black text-slate-800 focus:outline-none cursor-pointer uppercase font-mono min-w-[120px]"
                value={selectedDateC5}
                onChange={e => setSelectedDateC5(e.target.value)}
              >
                <option value="ALL">All Logged Dates</option>
                {availableDates.map(d => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </SearchableSelect>
            </div>
          </div>
        </div>

        {/* Units Selector */}
        <div className="space-y-2">
          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block">
            Select Factory Unit to Analyze
          </label>
          <div className="flex flex-wrap gap-2">
            {availableUnits.map(unit => {
              const isSelected = unit === activeUnit;
              return (
                <button
                  key={unit}
                  onClick={() => setSelectedUnitC5(unit)}
                  className={`px-4 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider transition cursor-pointer flex items-center gap-2 ${
                    isSelected
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-100 border border-indigo-600'
                      : 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200'
                  }`}
                >
                  <Icon name="home" size={14} className={isSelected ? 'text-white' : 'text-slate-400'} />
                  {unit}
                </button>
              );
            })}
          </div>
        </div>

        {/* Primary Metrics: TOTAL PRODUCTION, REWORK, REJECTION */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          
          {/* TOTAL PRODUCTION */}
          <div className="p-5 bg-emerald-50/30 border border-emerald-200/40 rounded-2xl shadow-xs flex flex-col justify-between">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <span className="text-[10px] font-black text-emerald-700 uppercase tracking-widest block">Total Production (Passed Pcs)</span>
                <p className="text-3xl font-black text-emerald-800 font-mono mt-2">
                  {totalPassed.toLocaleString()}
                </p>
              </div>
              <span className="p-2 bg-emerald-100 text-emerald-700 rounded-xl">
                <Icon name="check-circle" size={18} />
              </span>
            </div>
            <div className="mt-4 pt-3 border-t border-emerald-100/45 flex justify-between items-center text-[10px] font-bold text-emerald-600">
              <span className="uppercase tracking-wide">First-pass Quality Yield</span>
              <span className="font-mono font-black">{qualityYield}%</span>
            </div>
          </div>

          {/* TOTAL REWORK */}
          <div className="p-5 bg-amber-50/30 border border-amber-200/40 rounded-2xl shadow-xs flex flex-col justify-between">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <span className="text-[10px] font-black text-amber-700 uppercase tracking-widest block">Rework Logs</span>
                <p className="text-3xl font-black text-amber-800 font-mono mt-2">
                  {totalRework.toLocaleString()}
                </p>
              </div>
              <span className="p-2 bg-amber-100 text-amber-700 rounded-xl">
                <Icon name="alert-triangle" size={18} />
              </span>
            </div>
            <div className="mt-4 pt-3 border-t border-amber-100/45 flex justify-between items-center text-[10px] font-bold text-amber-600">
              <span className="uppercase tracking-wide">Incurred Rework Ratio</span>
              <span className="font-mono font-black">{reworkRate}%</span>
            </div>
          </div>

          {/* TOTAL REJECTION */}
          <div className="p-5 bg-rose-50/30 border border-rose-200/40 rounded-2xl shadow-xs flex flex-col justify-between">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <span className="text-[10px] font-black text-rose-700 uppercase tracking-widest block">Rejection / Fail Logs</span>
                <p className="text-3xl font-black text-rose-800 font-mono mt-2">
                  {totalRejection.toLocaleString()}
                </p>
              </div>
              <span className="p-2 bg-rose-100 text-rose-700 rounded-xl">
                <Icon name="x-circle" size={18} />
              </span>
            </div>
            <div className="mt-4 pt-3 border-t border-rose-100/45 flex justify-between items-center text-[10px] font-bold text-rose-600">
              <span className="uppercase tracking-wide">Rejection Rate</span>
              <span className="font-mono font-black">{rejectRate}%</span>
            </div>
          </div>

        </div>

        {/* Combined Stylewise & Sizewise Production Breakdown box */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-xs p-5 space-y-4">
          <div>
            <h3 className="text-sm font-black text-slate-800 uppercase tracking-wide flex items-center gap-1.5">
              <Icon name="tag" size={16} className="text-indigo-600" />
              Style-wise & Size-wise Production Yield
            </h3>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
              Consolidated production volume breakdown segmented by Style and Garment Size under {activeUnit}
            </p>
          </div>

          <div className="overflow-x-auto pt-2">
            {styleSizewise.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-400 italic">
                No style or size records logged for this unit & date.
              </div>
            ) : (
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-450 font-black uppercase text-[9px] tracking-wider text-slate-400">
                    <th className="pb-3 text-left">Style Reference</th>
                    <th className="pb-3 text-left">Garment Size</th>
                    <th className="pb-3 text-center">Checked Pcs</th>
                    <th className="pb-3 text-center">Passed (Prod)</th>
                    <th className="pb-3 text-center">Rework</th>
                    <th className="pb-3 text-center">Rejections</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {styleSizewise.map((row, idx) => (
                    <tr key={`${row.style}-${row.size}-${idx}`} className="hover:bg-slate-50/40 transition">
                      <td className="py-2.5 font-black text-slate-800 uppercase">{row.style}</td>
                      <td className="py-2.5">
                        <span className="font-mono bg-slate-100 border border-slate-200 text-slate-700 px-2 py-0.5 rounded text-[10px] font-black uppercase">
                          Size {row.size}
                        </span>
                      </td>
                      <td className="py-2.5 text-center font-mono font-bold text-slate-600">{row.checked}</td>
                      <td className="py-2.5 text-center font-mono font-black text-emerald-600">{row.pass}</td>
                      <td className="py-2.5 text-center font-mono font-bold text-amber-600">{row.rework}</td>
                      <td className="py-2.5 text-center font-mono font-bold text-rose-600">{row.fail}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

      </div>
    );
  }

  // Fallback views for other submodules (C2, C3, C4, C5, C8, etc.)
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <div className="p-3 glass-card border-l-4 border-indigo-500">
          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Total Pass</span>
          <p className="text-xl font-black text-slate-800">{summary.totalPass}</p>
        </div>
        <div className="p-3 glass-card border-l-4 border-amber-500">
          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Total Rework</span>
          <p className="text-xl font-black text-slate-800">{summary.totalRework}</p>
        </div>
        <div className="p-3 glass-card border-l-4 border-rose-500">
          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Total Fail</span>
          <p className="text-xl font-black text-slate-800">{summary.totalFail}</p>
        </div>
        <div className="p-3 glass-card border-l-4 border-emerald-500">
          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Quality Efficiency</span>
          <p className="text-xl font-black text-slate-800">{summary.avgEff}%</p>
        </div>
      </div>

      <div className="h-72 w-full glass-card p-4">
        <h3 className="text-xs font-bold text-slate-500 mb-4 uppercase tracking-wider">Quality Trend Analysis</h3>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="colorPass" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/>
                <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#64748b'}} />
            <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#64748b'}} />
            <Tooltip contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', fontSize: '10px'}} />
            <Legend verticalAlign="top" align="right" iconType="circle" wrapperStyle={{fontSize: '10px'}} />
            <Area type="monotone" dataKey="pass" stroke="#10b981" fillOpacity={1} fill="url(#colorPass)" strokeWidth={2} />
            <Area type="monotone" dataKey="rework" stroke="#f59e0b" fillOpacity={0} strokeWidth={2} />
            <Area type="monotone" dataKey="fail" stroke="#ef4444" fillOpacity={0} strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="h-60 glass-card p-4">
          <h3 className="text-[10px] font-bold text-slate-500 mb-4 uppercase tracking-wider">Defect Distribution</h3>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10}} />
              <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10}} />
              <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{borderRadius: '8px', border: 'none', fontSize: '10px'}} />
              <Bar dataKey="fail" fill="#f43f5e" radius={[4, 4, 0, 0]} barSize={20} />
              <Bar dataKey="rework" fill="#f59e0b" radius={[4, 4, 0, 0]} barSize={20} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="h-60 glass-card p-4">
          <h3 className="text-[10px] font-bold text-slate-500 mb-4 uppercase tracking-wider">Overall Quality Status</h3>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie 
                data={[
                  {name: 'Pass', value: summary.totalPass}, 
                  {name: 'Rework', value: summary.totalRework},
                  {name: 'Fail', value: summary.totalFail}
                ]} 
                innerRadius={45} 
                outerRadius={65} 
                paddingAngle={6} 
                dataKey="value"
                stroke="none"
              >
                <Cell fill="#10b981" />
                <Cell fill="#f59e0b" />
                <Cell fill="#f43f5e" />
              </Pie>
              <Tooltip contentStyle={{borderRadius: '8px', border: 'none', fontSize: '10px'}} />
              <Legend verticalAlign="bottom" wrapperStyle={{fontSize: '10px'}} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default MISView;

