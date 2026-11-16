var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// server.ts
var import_express = __toESM(require("express"), 1);
var import_path = __toESM(require("path"), 1);
var import_fs = __toESM(require("fs"), 1);
var import_genai = require("@google/genai");

// src/data/initialDb.ts
var INITIAL_DB = {
  "users": [
    {
      "userCode": "A001",
      "username": "ADMIN",
      "password": "admin123",
      "role": "ADMIN",
      "location": "COMMON",
      "restrictions": [],
      "canDownload": true,
      "zone": "COMMON",
      "userSettings": {
        "ZONE": [
          "KERALA"
        ],
        "UNIT": [
          "MUVATTUPUZHA",
          "ANGAMALY",
          "RAW MATERIAL STORE"
        ],
        "WORKERS": [
          "WORKER 1",
          "WORKER 2"
        ]
      }
    },
    {
      "userCode": "U002",
      "username": "NIMMY",
      "password": 123,
      "role": "WORKORDER",
      "location": "COMMON",
      "restrictions": [],
      "canDownload": true,
      "zone": "KERALA",
      "userSettings": {
        "ZONE": [
          "KERALA"
        ],
        "UNIT": [
          "MUVATTUPUZHA"
        ],
        "COLOR": [
          "BLACK",
          "WHITE",
          "NUDE",
          "MIXED"
        ],
        "SIZE": [
          "30",
          "32",
          "34",
          "36",
          "38",
          "40",
          "42",
          "44",
          "46"
        ],
        "CUPSIZE": [
          "B",
          "C",
          "D",
          "E",
          "F",
          "G"
        ],
        "DEFECTS": [
          "STAIN",
          "HOLE",
          "SHADING"
        ],
        "WORKERS": [
          "WORKER 1",
          "WORKER 2"
        ],
        "LINE": [
          "LINE 1",
          "LINE 2"
        ],
        "STYLE_NAME": [
          "A 6",
          "A6 THIN",
          "ABSOLUTE PLUS",
          "AUTHENTIC BRA",
          "BRIDAL FOAM",
          "CARE U",
          "CIRCET BRA",
          "COOL FOAM",
          "ETHNIC BRA",
          "FAVOURITE",
          "FULL MOON",
          "HAKO LIFT",
          "HONEST BRA",
          "JASMINE",
          "MADAMS",
          "MERCY SSU",
          "PLUS SIZE",
          "PRIYA SP",
          "PRIYA MOHINI",
          "PRIYA SAJINI",
          "PRETTY PLUS",
          "RUBY",
          "SAREE BRA",
          "TRUST ME",
          "WELL SUPPORT",
          "WOVEN RINGS",
          "MAGNA FIT",
          "MAX SUPPORT",
          "HAKO DSA",
          "TUNIC DSA"
        ]
      }
    },
    {
      "userCode": "U007",
      "username": "ADITHYA S MENON",
      "password": 9746514890,
      "role": "ADMIN",
      "location": "COMMON",
      "restrictions": [],
      "canDownload": true,
      "zone": "COMMON",
      "userSettings": {}
    },
    {
      "userCode": "U008",
      "username": "SONY LENIN",
      "password": 1980,
      "role": "USER",
      "location": "RAW MATERIAL STORE",
      "restrictions": [
        "C6",
        "C7",
        "C",
        "C1",
        "C2",
        "C3",
        "B4",
        "B5",
        "B6",
        "B7",
        "B8",
        "B3",
        "B2",
        "C4",
        "C5",
        "A6",
        "A5",
        "A7",
        "A4",
        "A3",
        "A2",
        "A8",
        "B9"
      ],
      "canDownload": false,
      "zone": "KERALA",
      "userSettings": {
        "ZONE": [
          "KERALA"
        ],
        "UNIT": [
          "MUVATTUPUZHA",
          "ANGAMALY",
          "RAW MATERIAL STORE"
        ],
        "COLOR": [
          "BLACK",
          "WHITE",
          "NAVY"
        ],
        "SIZE": [
          "S",
          "M",
          "L",
          "XL"
        ],
        "CUPSIZE": [
          "A",
          "B",
          "C"
        ],
        "DEFECTS": [
          "STAIN",
          "HOLE",
          "SHADING"
        ],
        "WORKERS": [
          "WORKER 1",
          "WORKER 2"
        ],
        "LINE": [
          "LINE 1",
          "LINE 2"
        ]
      }
    },
    {
      "userCode": "U009",
      "username": "ARUNDHATHI S NADH",
      "password": "adithya",
      "role": "ADMIN",
      "location": "COMMON",
      "restrictions": [],
      "canDownload": true,
      "zone": "COMMON",
      "userSettings": {}
    },
    {
      "userCode": "U010",
      "username": "SARI SATHYAN",
      "password": 144,
      "role": "USER",
      "location": "MUVATTUPUZHA",
      "restrictions": [
        "C",
        "C3",
        "C7",
        "C4",
        "C1",
        "C2",
        "C5",
        "C6",
        "A3",
        "A1",
        "A4",
        "A7",
        "A6",
        "A5",
        "B3",
        "B4",
        "B5",
        "B8",
        "B7",
        "B6",
        "B2",
        "B",
        "A8",
        "B9"
      ],
      "canDownload": false,
      "zone": "KERALA",
      "userSettings": {}
    },
    {
      "userCode": "U011",
      "username": "ADITHYA",
      "password": 123,
      "role": "USER",
      "location": "COMMON",
      "restrictions": [],
      "canDownload": true,
      "zone": "COMMON",
      "userSettings": {}
    },
    {
      "userCode": "U012",
      "username": "PRATHEEKSHA",
      "password": "PRATHI",
      "role": "USER",
      "location": "RAW MATERIAL STORE",
      "restrictions": [
        "A2",
        "A3",
        "A4",
        "A5",
        "A6",
        "A7",
        "B2",
        "B3",
        "B4",
        "B5",
        "B6",
        "B7",
        "B8",
        "C",
        "C1",
        "C2",
        "C3",
        "C4",
        "C5",
        "C6",
        "C7",
        "A8",
        "B9"
      ],
      "canDownload": false,
      "zone": "KERALA",
      "userSettings": {}
    },
    {
      "userCode": "U013",
      "username": "ATHUL KRISHNA",
      "password": "Blossom123",
      "role": "WORKORDER",
      "location": "MUVATTUPUZHA",
      "restrictions": [
        "A",
        "B",
        "C"
      ],
      "canDownload": true,
      "zone": "KERALA",
      "userSettings": {
        "ZONE": [
          "KERALA"
        ],
        "UNIT": [
          "MUVATTUPUZHA",
          "ANGAMALY",
          "RAW MATERIAL STORE"
        ],
        "COLOR": [
          "BLACK",
          "WHITE",
          "NUDE",
          "MIXED"
        ],
        "SIZE": [
          "30",
          "32",
          "34",
          "36",
          "38",
          "40",
          "42",
          "44",
          "46"
        ],
        "CUPSIZE": [
          "B",
          "C",
          "D",
          "E",
          "F",
          "G"
        ],
        "DEFECTS": [
          "STAIN",
          "HOLE",
          "SHADING"
        ],
        "WORKERS": [
          "WORKER 1",
          "WORKER 2"
        ],
        "LINE": [
          "LINE 1",
          "LINE 2"
        ],
        "STYLE_NAME": [
          "A 6",
          "A6 THIN",
          "ABSOLUTE PLUS",
          "AUTHENTIC BRA",
          "BRIDAL FOAM",
          "CARE U",
          "CIRCET BRA",
          "COOL FOAM",
          "ETHNIC BRA",
          "FAVOURITE",
          "FULL MOON",
          "HAKO LIFT",
          "HONEST BRA",
          "JASMINE",
          "MADAMS",
          "MERCY SSU",
          "PLUS SIZE",
          "PRIYA SP",
          "PRIYA MOHINI",
          "PRIYA SAJINI",
          "PRETTY PLUS",
          "RUBY",
          "SAREE BRA",
          "TRUST ME",
          "WELL SUPPORT",
          "WOVEN RINGS",
          "MAGNA FIT",
          "MAX SUPPORT",
          "HAKO DSA",
          "TUNIC DSA",
          "LOVELY PAD",
          "ESSENTIAL BRA",
          "RINGLET"
        ]
      }
    },
    {
      "userCode": "U014",
      "username": "VENKATESAN E",
      "password": 123,
      "role": "USER",
      "location": "COMMON",
      "restrictions": [],
      "canDownload": true,
      "zone": "COMMON",
      "userSettings": {}
    },
    {
      "userCode": "U015",
      "username": "VISHNUKUMAR",
      "password": 123,
      "role": "USER",
      "location": "RAW MATERIAL STORE - TUP",
      "restrictions": [
        "B2",
        "B6",
        "B7",
        "B8",
        "B5",
        "B4",
        "B3",
        "A2",
        "A3",
        "A4",
        "A5",
        "A6",
        "A7",
        "C1",
        "C2",
        "C",
        "C3",
        "C4",
        "C5",
        "C6",
        "C7",
        "A8",
        "B9"
      ],
      "canDownload": false,
      "zone": "TIRUPUR",
      "userSettings": {}
    },
    {
      "userCode": "U016",
      "username": "VARALAKSHMI",
      "password": 123,
      "role": "USER",
      "location": "RAW MATERIAL STORE - BNGLR",
      "restrictions": [
        "A2",
        "A3",
        "A4",
        "A5",
        "A6",
        "A7",
        "B2",
        "B3",
        "B4",
        "B5",
        "B6",
        "B7",
        "B8",
        "C",
        "C1",
        "C2",
        "C7",
        "C6",
        "C5",
        "C3",
        "C4",
        "A8",
        "B9"
      ],
      "canDownload": true,
      "zone": "BANGALORE",
      "userSettings": {}
    }
  ],
  "workorders": [
    {
      "zone": "KERALA",
      "location": "KERALA",
      "workorderNumber": 2201060059,
      "style": "A 6",
      "styleName": "A 6",
      "size": "30 - 34",
      "cup": "B, F",
      "quantity": 100,
      "orderQty": 100,
      "colour": "MIXED",
      "color": "MIXED",
      "id": "wo-1790321111782-9040e",
      "status": "COMPLETED",
      "createdAt": "2026-09-25T07:25:11.782Z",
      "createdBy": "ATHUL KRISHNA"
    },
    {
      "zone": "KERALA",
      "location": "KERALA",
      "workorderNumber": 10183,
      "style": "WELL SUPPORT",
      "styleName": "WELL SUPPORT",
      "size": "32 - 40",
      "cup": "B",
      "quantity": 4e3,
      "orderQty": 4e3,
      "colour": "MIXED",
      "color": "MIXED",
      "id": "wo-1788949287890-7y5e5",
      "status": "INLINE_AND_ENDLINE",
      "createdAt": "2026-09-09T10:21:27.890Z",
      "createdBy": "ATHUL KRISHNA"
    },
    {
      "zone": "KERALA",
      "location": "KERALA",
      "workorderNumber": 10182,
      "style": "MADAMS",
      "styleName": "MADAMS",
      "size": "34 - 44",
      "cup": "B",
      "quantity": 1400,
      "orderQty": 1400,
      "colour": "WHITE",
      "color": "WHITE",
      "id": "wo-1788948690891-kawef",
      "status": "PRECUTTING",
      "createdAt": "2026-09-09T10:11:30.891Z",
      "createdBy": "ATHUL KRISHNA"
    },
    {
      "zone": "KERALA",
      "location": "KERALA",
      "workorderNumber": 10181,
      "style": "MADAMS",
      "styleName": "MADAMS",
      "size": "34 - 44",
      "cup": "B",
      "quantity": 2200,
      "orderQty": 2200,
      "colour": "",
      "color": "",
      "id": "wo-1788948621283-bzq9v",
      "status": "PRECUTTING",
      "createdAt": "2026-09-09T10:10:21.283Z",
      "createdBy": "ATHUL KRISHNA"
    },
    {
      "zone": "KERALA",
      "location": "KERALA",
      "workorderNumber": 10180,
      "style": "JASMINE",
      "styleName": "JASMINE",
      "size": "32 - 42",
      "cup": "B",
      "quantity": 2400,
      "orderQty": 2400,
      "colour": "MIXED",
      "color": "MIXED",
      "id": "wo-1788948569948-4gi3x",
      "status": "PRECUTTING",
      "createdAt": "2026-09-09T10:09:29.948Z",
      "createdBy": "ATHUL KRISHNA"
    },
    {
      "zone": "KERALA",
      "location": "KERALA",
      "workorderNumber": 20075,
      "style": "PLUS SIZE",
      "styleName": "PLUS SIZE",
      "size": "34 - 42",
      "cup": "C, D",
      "quantity": 2600,
      "orderQty": 2600,
      "colour": "NUDE",
      "color": "NUDE",
      "id": "wo-1788948517578-5nkm8",
      "status": "PRECUTTING",
      "createdAt": "2026-09-09T10:08:37.578Z",
      "createdBy": "ATHUL KRISHNA"
    },
    {
      "zone": "KERALA",
      "location": "KERALA",
      "workorderNumber": 20076,
      "style": "PLUS SIZE",
      "styleName": "PLUS SIZE",
      "size": "34 - 40",
      "cup": "C",
      "quantity": 1e3,
      "orderQty": 1e3,
      "colour": "WHITE",
      "color": "WHITE",
      "id": "wo-1788948470458-qd7wa",
      "status": "PRECUTTING",
      "createdAt": "2026-09-09T10:07:50.458Z",
      "createdBy": "ATHUL KRISHNA"
    },
    {
      "zone": "KERALA",
      "location": "KERALA",
      "workorderNumber": 20079,
      "style": "SAREE BRA",
      "styleName": "SAREE BRA",
      "size": "30 - 42",
      "cup": "B",
      "quantity": 5100,
      "orderQty": 5100,
      "colour": "MIXED",
      "color": "MIXED",
      "id": "wo-1788948199706-41gp0",
      "status": "PASS_AND_HOLD",
      "createdAt": "2026-09-09T10:03:19.706Z",
      "createdBy": "ATHUL KRISHNA"
    },
    {
      "zone": "KERALA",
      "location": "KERALA",
      "workorderNumber": 20072,
      "style": "LOVELY PAD",
      "styleName": "LOVELY PAD",
      "size": "34 - 38",
      "cup": "B",
      "quantity": 1100,
      "orderQty": 1100,
      "colour": "MIXED",
      "color": "MIXED",
      "id": "wo-1788947879029-fp1rd",
      "status": "PRECUTTING",
      "createdAt": "2026-09-09T09:57:59.029Z",
      "createdBy": "ATHUL KRISHNA"
    },
    {
      "zone": "KERALA",
      "location": "KERALA",
      "workorderNumber": 30049,
      "style": "PRIYA SAJINI",
      "styleName": "PRIYA SAJINI",
      "size": "32 - 42",
      "cup": "B",
      "quantity": 1300,
      "orderQty": 1300,
      "colour": "BLACK",
      "color": "BLACK",
      "id": "wo-1788845307716-ij7en",
      "status": "INLINE_AND_ENDLINE",
      "createdAt": "2026-09-08T05:28:27.717Z",
      "createdBy": "ATHUL KRISHNA"
    },
    {
      "zone": "KERALA",
      "location": "KERALA",
      "workorderNumber": 20074,
      "style": "SAREE BRA",
      "styleName": "SAREE BRA",
      "size": "32 - 42",
      "cup": "B, C",
      "quantity": 3e3,
      "orderQty": 3e3,
      "colour": "NUDE",
      "color": "NUDE",
      "id": "wo-1788845002911-away6",
      "status": "INLINE_AND_ENDLINE",
      "createdAt": "2026-09-08T05:23:22.911Z",
      "createdBy": "ATHUL KRISHNA"
    },
    {
      "zone": "KERALA",
      "location": "KERALA",
      "workorderNumber": 30048,
      "style": "AUTHENTIC BRA",
      "styleName": "AUTHENTIC BRA",
      "size": "32 - 42",
      "cup": "B",
      "quantity": 2600,
      "orderQty": 2600,
      "colour": "MIXED",
      "color": "MIXED",
      "id": "wo-1788594227147-ujzmv",
      "status": "CUTTING",
      "createdAt": "2026-09-05T07:43:47.147Z",
      "createdBy": "ATHUL KRISHNA"
    },
    {
      "zone": "KERALA",
      "location": "KERALA",
      "workorderNumber": 10179,
      "style": "JASMINE",
      "styleName": "JASMINE",
      "size": "32 - 42",
      "cup": "B",
      "quantity": 1900,
      "orderQty": 1900,
      "colour": "NUDE",
      "color": "NUDE",
      "id": "wo-1788594155138-f49t1",
      "status": "INLINE_AND_ENDLINE",
      "createdAt": "2026-09-05T07:42:35.138Z",
      "createdBy": "ATHUL KRISHNA"
    },
    {
      "zone": "KERALA",
      "location": "KERALA",
      "workorderNumber": 30050,
      "style": "PRIYA SAJINI",
      "styleName": "PRIYA SAJINI",
      "size": "32 - 44",
      "cup": "C",
      "quantity": 2400,
      "orderQty": 2400,
      "colour": "NUDE",
      "color": "NUDE",
      "id": "wo-1788593927395-sayeu",
      "status": "INLINE_AND_ENDLINE",
      "createdAt": "2026-09-05T07:38:47.395Z",
      "createdBy": "ATHUL KRISHNA"
    },
    {
      "zone": "KERALA",
      "location": "KERALA",
      "workorderNumber": 20071,
      "style": "PLUS SIZE",
      "styleName": "PLUS SIZE",
      "size": "32 - 42",
      "cup": "C",
      "quantity": 1260,
      "orderQty": 1260,
      "colour": "MIXED",
      "color": "MIXED",
      "id": "wo-1788580787613-pzryw",
      "status": "INLINE_AND_ENDLINE",
      "createdAt": "2026-09-05T03:59:47.613Z",
      "createdBy": "ATHUL KRISHNA"
    },
    {
      "zone": "KERALA",
      "location": "KERALA",
      "workorderNumber": 10174,
      "style": "PRIYA SAJINI",
      "styleName": "PRIYA SAJINI",
      "size": "34 - 44",
      "cup": "C",
      "quantity": 3e3,
      "orderQty": 3e3,
      "colour": "MIXED",
      "color": "MIXED",
      "id": "wo-1788409832605-krlti",
      "status": "INLINE_AND_ENDLINE",
      "createdAt": "2026-09-03T04:30:32.605Z",
      "createdBy": "ATHUL KRISHNA"
    },
    {
      "zone": "KERALA",
      "location": "KERALA",
      "workorderNumber": 10175,
      "style": "PRIYA SAJINI",
      "styleName": "PRIYA SAJINI",
      "size": "32 - 42",
      "cup": "B",
      "quantity": 6100,
      "orderQty": 6100,
      "colour": "MIXED",
      "color": "MIXED",
      "id": "wo-1788409001597-67pni",
      "status": "INLINE_AND_ENDLINE",
      "createdAt": "2026-09-03T04:16:41.597Z",
      "createdBy": "ATHUL KRISHNA"
    },
    {
      "zone": "KERALA",
      "location": "KERALA",
      "workorderNumber": 30047,
      "style": "PRIYA SAJINI",
      "styleName": "PRIYA SAJINI",
      "size": "34 - 42",
      "cup": "D",
      "quantity": 3300,
      "orderQty": 3300,
      "colour": "MIXED",
      "color": "MIXED",
      "id": "wo-1788406665703-snpob",
      "status": "INLINE_AND_ENDLINE",
      "createdAt": "2026-09-03T03:37:45.703Z",
      "createdBy": "ATHUL KRISHNA"
    }
  ],
  "material_reports": [
    {
      "timestamp": "2026-09-26T11:18:06.197Z",
      "receivedDate": "2026-09-21T18:30:00.000Z",
      "checkingDate": "2026-09-25T18:30:00.000Z",
      "date": "2026-09-25T18:30:00.000Z",
      "grn": 1385,
      "billNo": 1839,
      "supplierName": "SACHINAM FABRICS PVT LTD",
      "materialType": "Raw Material",
      "materialCategory": "Raw Material",
      "itemName": "ELASTIC MICRO NARROW WOVEN BUFF 84%NYLON 16%SPNDX 14MM\xA0 MEDIVIEVAL BLUE",
      "receivedQuantity": 20120,
      "checkedQuantity": 6036,
      "passQuantity": 20120,
      "rejectedQuantity": 0,
      "itemRemarks": "PASS",
      "generalRemarks": "PASS",
      "zone": "KERALA",
      "location": "KERALA",
      "inspector": "SONY LENIN",
      "id": "2bddd391-f4b6-4a9f-996d-f11dcda56923"
    },
    {
      "timestamp": "2026-09-26T11:18:06.197Z",
      "receivedDate": "2026-09-21T18:30:00.000Z",
      "checkingDate": "2026-09-25T18:30:00.000Z",
      "date": "2026-09-25T18:30:00.000Z",
      "grn": 1385,
      "billNo": 1839,
      "supplierName": "SACHINAM FABRICS PVT LTD",
      "materialType": "Raw Material",
      "materialCategory": "Raw Material",
      "itemName": "ELASTIC MICRO NARROW WOVEN BUFF 84%NYLON 16%SPNDX 18MM\xA0SEPLA ROSE",
      "receivedQuantity": 4940,
      "checkedQuantity": 1482,
      "passQuantity": 4940,
      "rejectedQuantity": 0,
      "itemRemarks": "PASS",
      "generalRemarks": "PASS",
      "zone": "KERALA",
      "location": "KERALA",
      "inspector": "SONY LENIN",
      "id": "36f5d67c-8f06-4850-84f2-3e088c8e1d80"
    },
    {
      "timestamp": "2026-09-26T11:12:29.129Z",
      "receivedDate": "2026-09-20T18:30:00.000Z",
      "checkingDate": "2026-09-25T18:30:00.000Z",
      "date": "2026-09-25T18:30:00.000Z",
      "grn": 1325,
      "billNo": "LBF260005297",
      "supplierName": "VARDHMAN TEXTILES LIMITED",
      "materialType": "Raw Material",
      "materialCategory": "Raw Material",
      "itemName": "CLOTH WOVEN 132 EPI-72PPI 100%CTN 40S 125GSM 58INCH WHITE",
      "receivedQuantity": 4089,
      "checkedQuantity": 1226,
      "passQuantity": 4089,
      "rejectedQuantity": 0,
      "itemRemarks": "PASS",
      "generalRemarks": "PASS",
      "zone": "KERALA",
      "location": "KERALA",
      "inspector": "SONY LENIN",
      "id": "2605d6d2-4d61-4039-a1d0-8a83cabc983f"
    },
    {
      "timestamp": "2026-09-26T11:12:29.129Z",
      "receivedDate": "2026-09-20T18:30:00.000Z",
      "checkingDate": "2026-09-25T18:30:00.000Z",
      "date": "2026-09-25T18:30:00.000Z",
      "grn": 1325,
      "billNo": "LBF260005297",
      "supplierName": "VARDHMAN TEXTILES LIMITED",
      "materialType": "Raw Material",
      "materialCategory": "Raw Material",
      "itemName": "CLOTH WOVEN 132 EPI-72PPI 100%CTN 40S 125GSM 58INCH SLATE",
      "receivedQuantity": 1028,
      "checkedQuantity": 308,
      "passQuantity": 1028,
      "rejectedQuantity": 0,
      "itemRemarks": "PASS",
      "generalRemarks": "PASS",
      "zone": "KERALA",
      "location": "KERALA",
      "inspector": "SONY LENIN",
      "id": "8361f588-234c-4f70-8a62-3c4c484ab722"
    },
    {
      "timestamp": "2026-09-26T11:12:29.129Z",
      "receivedDate": "2026-09-20T18:30:00.000Z",
      "checkingDate": "2026-09-25T18:30:00.000Z",
      "date": "2026-09-25T18:30:00.000Z",
      "grn": 1325,
      "billNo": "LBF260005297",
      "supplierName": "VARDHMAN TEXTILES LIMITED",
      "materialType": "Raw Material",
      "materialCategory": "Raw Material",
      "itemName": "CLOTH WOVEN 132 EPI-72PPI 100%CTN 40S 125GSM 58INCH\xA0BURL WOOD",
      "receivedQuantity": 1029,
      "checkedQuantity": 308,
      "passQuantity": 1029,
      "rejectedQuantity": 0,
      "itemRemarks": "PASS",
      "generalRemarks": "PASS",
      "zone": "KERALA",
      "location": "KERALA",
      "inspector": "SONY LENIN",
      "id": "0004dfb1-7970-4695-9403-2c99e02beb72"
    },
    {
      "timestamp": "2026-09-26T11:12:29.129Z",
      "receivedDate": "2026-09-20T18:30:00.000Z",
      "checkingDate": "2026-09-25T18:30:00.000Z",
      "date": "2026-09-25T18:30:00.000Z",
      "grn": 1325,
      "billNo": "LBF260005297",
      "supplierName": "VARDHMAN TEXTILES LIMITED",
      "materialType": "Raw Material",
      "materialCategory": "Raw Material",
      "itemName": "CLOTH WOVEN 132 EPI-72PPI 100%CTN 40S 125GSM 58INCH SEPLA ROSE",
      "receivedQuantity": 1027,
      "checkedQuantity": 308,
      "passQuantity": 1027,
      "rejectedQuantity": 0,
      "itemRemarks": "PASS",
      "generalRemarks": "PASS",
      "zone": "KERALA",
      "location": "KERALA",
      "inspector": "SONY LENIN",
      "id": "5017a1e7-840d-4931-856f-dbf1d6c165f4"
    },
    {
      "timestamp": "2026-09-26T11:12:29.129Z",
      "receivedDate": "2026-09-20T18:30:00.000Z",
      "checkingDate": "2026-09-25T18:30:00.000Z",
      "date": "2026-09-25T18:30:00.000Z",
      "grn": 1325,
      "billNo": "LBF260005297",
      "supplierName": "VARDHMAN TEXTILES LIMITED",
      "materialType": "Raw Material",
      "materialCategory": "Raw Material",
      "itemName": "CLOTH WOVEN 132 EPI-72PPI 100%CTN 40S 125GSM 58INCH QUAIL",
      "receivedQuantity": 1010,
      "checkedQuantity": 303,
      "passQuantity": 1010,
      "rejectedQuantity": 0,
      "itemRemarks": "PASS",
      "generalRemarks": "PASS",
      "zone": "KERALA",
      "location": "KERALA",
      "inspector": "SONY LENIN",
      "id": "46638b66-2bfa-4e43-b957-de9e89cd8ba1"
    },
    {
      "timestamp": "2026-09-26T11:12:29.129Z",
      "receivedDate": "2026-09-20T18:30:00.000Z",
      "checkingDate": "2026-09-25T18:30:00.000Z",
      "date": "2026-09-25T18:30:00.000Z",
      "grn": 1325,
      "billNo": "LBF260005297",
      "supplierName": "VARDHMAN TEXTILES LIMITED",
      "materialType": "Raw Material",
      "materialCategory": "Raw Material",
      "itemName": "CLOTH WOVEN 132 EPI-72PPI 100%CTN 40S 125GSM 58INCH DEEP TAUPE",
      "receivedQuantity": 1021,
      "checkedQuantity": 306,
      "passQuantity": 1021,
      "rejectedQuantity": 0,
      "itemRemarks": "PASS",
      "generalRemarks": "PASS",
      "zone": "KERALA",
      "location": "KERALA",
      "inspector": "SONY LENIN",
      "id": "ea6e0ebe-cb36-4e58-8a69-4304ea77e7ed"
    },
    {
      "timestamp": "2026-09-26T11:12:29.129Z",
      "receivedDate": "2026-09-20T18:30:00.000Z",
      "checkingDate": "2026-09-25T18:30:00.000Z",
      "date": "2026-09-25T18:30:00.000Z",
      "grn": 1325,
      "billNo": "LBF260005297",
      "supplierName": "VARDHMAN TEXTILES LIMITED",
      "materialType": "Raw Material",
      "materialCategory": "Raw Material",
      "itemName": "CLOTH WOVEN 132 EPI-72PPI 100%CTN 40S 125GSM 58INCH CORONET BLUE",
      "receivedQuantity": 1023,
      "checkedQuantity": 306,
      "passQuantity": 1023,
      "rejectedQuantity": 0,
      "itemRemarks": "PASS",
      "generalRemarks": "PASS",
      "zone": "KERALA",
      "location": "KERALA",
      "inspector": "SONY LENIN",
      "id": "706b127e-02b4-4c77-a26a-340c567f1548"
    },
    {
      "timestamp": "2026-09-26T11:12:29.129Z",
      "receivedDate": "2026-09-20T18:30:00.000Z",
      "checkingDate": "2026-09-25T18:30:00.000Z",
      "date": "2026-09-25T18:30:00.000Z",
      "grn": 1325,
      "billNo": "LBF260005297",
      "supplierName": "VARDHMAN TEXTILES LIMITED",
      "materialType": "Raw Material",
      "materialCategory": "Raw Material",
      "itemName": "CLOTH WOVEN 132 EPI-72PPI 100%CTN 40S 125GSM 58INCH BLACK",
      "receivedQuantity": 1023,
      "checkedQuantity": 306,
      "passQuantity": 1023,
      "rejectedQuantity": 0,
      "itemRemarks": "PASS",
      "generalRemarks": "PASS",
      "zone": "KERALA",
      "location": "KERALA",
      "inspector": "SONY LENIN",
      "id": "29abd10d-f23d-4df2-ae80-3d16440fb7e3"
    },
    {
      "timestamp": "2026-09-25T08:56:37.238Z",
      "receivedDate": "2026-08-27T18:30:00.000Z",
      "checkingDate": "2026-09-23T18:30:00.000Z",
      "date": "2026-09-23T18:30:00.000Z",
      "grn": 1183,
      "billNo": "NIIPL/26-27/0641",
      "supplierName": "NILESH IMPEX INDIA PRIVATE LIMITED",
      "materialType": "Raw Material",
      "materialCategory": "Raw Material",
      "itemName": "CLOTH WOVEN HACOBA MN 4185  100%CTN 40S 132 NUDE",
      "receivedQuantity": 162,
      "checkedQuantity": 162,
      "passQuantity": 145,
      "rejectedQuantity": 17,
      "itemRemarks": "PASS",
      "generalRemarks": "17 MTR REJECTED DUE TO PATCHES & FLOWER COMPLINT . BALACE QUANTITY PASS.",
      "zone": "KERALA",
      "location": "KERALA",
      "inspector": "SONY LENIN",
      "id": "70736a10-355e-4075-9063-2a63e7228953"
    },
    {
      "timestamp": "2026-09-25T08:56:37.238Z",
      "receivedDate": "2026-08-27T18:30:00.000Z",
      "checkingDate": "2026-09-23T18:30:00.000Z",
      "date": "2026-09-23T18:30:00.000Z",
      "grn": 1183,
      "billNo": "NIIPL/26-27/0641",
      "supplierName": "NILESH IMPEX INDIA PRIVATE LIMITED",
      "materialType": "Raw Material",
      "materialCategory": "Raw Material",
      "itemName": "CLOTH WOVEN HACOBA MN 4185  100%CTN 40S 132SEPLA ROSE",
      "receivedQuantity": 162,
      "checkedQuantity": 162,
      "passQuantity": 162,
      "rejectedQuantity": 0,
      "itemRemarks": "PASS",
      "generalRemarks": "17 MTR REJECTED DUE TO PATCHES & FLOWER COMPLINT . BALACE QUANTITY PASS.",
      "zone": "KERALA",
      "location": "KERALA",
      "inspector": "SONY LENIN",
      "id": "3c547ede-c3dd-4a40-9da7-6392fe8faad8"
    },
    {
      "timestamp": "2026-09-25T08:56:37.238Z",
      "receivedDate": "2026-08-27T18:30:00.000Z",
      "checkingDate": "2026-09-23T18:30:00.000Z",
      "date": "2026-09-23T18:30:00.000Z",
      "grn": 1183,
      "billNo": "NIIPL/26-27/0641",
      "supplierName": "NILESH IMPEX INDIA PRIVATE LIMITED",
      "materialType": "Raw Material",
      "materialCategory": "Raw Material",
      "itemName": "CLOTH WOVEN HACOBA MN 4185  100%CTN 40S 132BURLWOOD",
      "receivedQuantity": 162,
      "checkedQuantity": 162,
      "passQuantity": 162,
      "rejectedQuantity": 0,
      "itemRemarks": "PASS",
      "generalRemarks": "17 MTR REJECTED DUE TO PATCHES & FLOWER COMPLINT . BALACE QUANTITY PASS.",
      "zone": "KERALA",
      "location": "KERALA",
      "inspector": "SONY LENIN",
      "id": "6f3e428e-d21b-4b5f-a564-8b058e17b4c8"
    },
    {
      "timestamp": "2026-09-24T10:10:10.446Z",
      "receivedDate": "2026-09-21T18:30:00.000Z",
      "checkingDate": "2026-09-23T18:30:00.000Z",
      "date": "2026-09-23T18:30:00.000Z",
      "grn": 1342,
      "billNo": "P426020932",
      "supplierName": "Vardhaman Yarns and Threads Limited",
      "materialType": "Raw Material",
      "materialCategory": "Raw Material",
      "itemName": "THREAD TRILOBAL PLSTR 27TX 2000MTRS DEEP TAUPE",
      "receivedQuantity": 24,
      "checkedQuantity": 7,
      "passQuantity": 24,
      "rejectedQuantity": 0,
      "itemRemarks": "PASS",
      "generalRemarks": "PASS",
      "zone": "KERALA",
      "location": "KERALA",
      "inspector": "SONY LENIN",
      "id": "5658470a-39bd-4ee6-8997-9a8c62009a2d"
    },
    {
      "timestamp": "2026-09-24T10:07:51.231Z",
      "receivedDate": "2026-09-21T18:30:00.000Z",
      "checkingDate": "2026-09-23T18:30:00.000Z",
      "date": "2026-09-23T18:30:00.000Z",
      "grn": 1343,
      "billNo": "E126009991",
      "supplierName": "Vardhaman Yarns and Threads Limited",
      "materialType": "Raw Material",
      "materialCategory": "Raw Material",
      "itemName": "THREAD CTN 20s 1000 WHITE",
      "receivedQuantity": 50,
      "checkedQuantity": 15,
      "passQuantity": 50,
      "rejectedQuantity": 0,
      "itemRemarks": "PASS",
      "generalRemarks": "",
      "zone": "KERALA",
      "location": "KERALA",
      "inspector": "SONY LENIN",
      "id": "fbd1023a-2613-42e3-abe4-394a9de12693"
    },
    {
      "timestamp": "2026-09-24T09:28:18.084Z",
      "receivedDate": "2026-09-22T18:30:00.000Z",
      "checkingDate": "2026-09-23T18:30:00.000Z",
      "date": "2026-09-23T18:30:00.000Z",
      "grn": 1347,
      "billNo": "SHE/E/2627/00164",
      "supplierName": "GINZA INDUSTRIES LTD",
      "materialType": "Raw Material",
      "materialCategory": "Raw Material",
      "itemName": "HOOK-EYE 3x3 MICRO FIBER NYLON-SS 45-60MM NON BRUSHED-RELUX RFD",
      "receivedQuantity": 7668,
      "checkedQuantity": 2300,
      "passQuantity": 7668,
      "rejectedQuantity": 0,
      "itemRemarks": "PASS",
      "generalRemarks": "PASS",
      "zone": "KERALA",
      "location": "KERALA",
      "inspector": "SONY LENIN",
      "id": "e2ec444e-bb58-4635-a2d6-2e0b90e35daa"
    },
    {
      "timestamp": "2026-09-24T09:28:18.084Z",
      "receivedDate": "2026-09-22T18:30:00.000Z",
      "checkingDate": "2026-09-23T18:30:00.000Z",
      "date": "2026-09-23T18:30:00.000Z",
      "grn": 1347,
      "billNo": "SHE/E/2627/00164",
      "supplierName": "GINZA INDUSTRIES LTD",
      "materialType": "Raw Material",
      "materialCategory": "Raw Material",
      "itemName": "HOOK-EYE 2x3 MICRO FIBER NYLON-SS 32-60MM NON BRUSHED-RELUX NUDE",
      "receivedQuantity": 7200,
      "checkedQuantity": 2160,
      "passQuantity": 7200,
      "rejectedQuantity": 0,
      "itemRemarks": "PASS",
      "generalRemarks": "PASS",
      "zone": "KERALA",
      "location": "KERALA",
      "inspector": "SONY LENIN",
      "id": "4a3bef87-a6e7-4617-8852-6b9320ae80a2"
    },
    {
      "timestamp": "2026-09-24T09:19:59.804Z",
      "receivedDate": "2026-09-22T18:30:00.000Z",
      "checkingDate": "2026-09-23T18:30:00.000Z",
      "date": "2026-09-23T18:30:00.000Z",
      "grn": 1349,
      "billNo": "TRF27KT/200334",
      "supplierName": "BLOSSOM INNERS PVT LTD - BANGLORE",
      "materialType": "Raw Material",
      "materialCategory": "Raw Material",
      "itemName": "ELASTIC NARROW WOVEN BUFF 84%NYLON 16%SPNDX 12MM SN51-12 AUTUMN COPPER",
      "receivedQuantity": 1470,
      "checkedQuantity": 441,
      "passQuantity": 1470,
      "rejectedQuantity": 0,
      "itemRemarks": "PASS",
      "generalRemarks": "PASS",
      "zone": "KERALA",
      "location": "KERALA",
      "inspector": "SONY LENIN",
      "id": "167ec522-1388-476f-a6bc-f5b127556bd1"
    },
    {
      "timestamp": "2026-09-24T09:19:59.804Z",
      "receivedDate": "2026-09-22T18:30:00.000Z",
      "checkingDate": "2026-09-23T18:30:00.000Z",
      "date": "2026-09-23T18:30:00.000Z",
      "grn": 1349,
      "billNo": "TRF27KT/200334",
      "supplierName": "BLOSSOM INNERS PVT LTD - BANGLORE",
      "materialType": "Raw Material",
      "materialCategory": "Raw Material",
      "itemName": "ELASTIC NARROW WOVEN BUFF 84%NYLON 16%SPNDX 14MM SN51-14 AUTUMN COPPER",
      "receivedQuantity": 1144,
      "checkedQuantity": 343,
      "passQuantity": 1144,
      "rejectedQuantity": 0,
      "itemRemarks": "PASS",
      "generalRemarks": "PASS",
      "zone": "KERALA",
      "location": "KERALA",
      "inspector": "SONY LENIN",
      "id": "8f422191-dedd-4b68-8997-3106f4eda161"
    },
    {
      "timestamp": "2026-09-24T09:19:59.804Z",
      "receivedDate": "2026-09-22T18:30:00.000Z",
      "checkingDate": "2026-09-23T18:30:00.000Z",
      "date": "2026-09-23T18:30:00.000Z",
      "grn": 1349,
      "billNo": "TRF27KT/200334",
      "supplierName": "BLOSSOM INNERS PVT LTD - BANGLORE",
      "materialType": "Raw Material",
      "materialCategory": "Raw Material",
      "itemName": "ELASTIC NARROW WOVEN FOLDING 77%NYLON 23%SPNDX 15MM SN312-15\xA0AUTUMN COPPER",
      "receivedQuantity": 950,
      "checkedQuantity": 285,
      "passQuantity": 950,
      "rejectedQuantity": 0,
      "itemRemarks": "PASS",
      "generalRemarks": "PASS",
      "zone": "KERALA",
      "location": "KERALA",
      "inspector": "SONY LENIN",
      "id": "7a45c870-9fbe-4674-8a26-e516c3ba6a04"
    },
    {
      "timestamp": "2026-09-24T09:19:59.804Z",
      "receivedDate": "2026-09-22T18:30:00.000Z",
      "checkingDate": "2026-09-23T18:30:00.000Z",
      "date": "2026-09-23T18:30:00.000Z",
      "grn": 1349,
      "billNo": "TRF27KT/200334",
      "supplierName": "BLOSSOM INNERS PVT LTD - BANGLORE",
      "materialType": "Raw Material",
      "materialCategory": "Raw Material",
      "itemName": "TAPE NARROW WOVEN BINDING 100%NYLON 18MM SN201-18 AUTUMN COPPER",
      "receivedQuantity": 1025,
      "checkedQuantity": 307,
      "passQuantity": 1025,
      "rejectedQuantity": 0,
      "itemRemarks": "PASS",
      "generalRemarks": "PASS",
      "zone": "KERALA",
      "location": "KERALA",
      "inspector": "SONY LENIN",
      "id": "634353b1-8b6a-45fd-8fd9-51d8a96ff5cd"
    },
    {
      "timestamp": "2026-09-24T09:19:59.804Z",
      "receivedDate": "2026-09-22T18:30:00.000Z",
      "checkingDate": "2026-09-23T18:30:00.000Z",
      "date": "2026-09-23T18:30:00.000Z",
      "grn": 1349,
      "billNo": "TRF27KT/200334",
      "supplierName": "BLOSSOM INNERS PVT LTD - BANGLORE",
      "materialType": "Raw Material",
      "materialCategory": "Raw Material",
      "itemName": "THREAD 3PLY PLSTR 24TX 5000MTRS AUTUMN COPPER",
      "receivedQuantity": 15,
      "checkedQuantity": 5,
      "passQuantity": 15,
      "rejectedQuantity": 0,
      "itemRemarks": "PASS",
      "generalRemarks": "PASS",
      "zone": "KERALA",
      "location": "KERALA",
      "inspector": "SONY LENIN",
      "id": "5d6ac4a5-ff22-41f4-acde-43102481af63"
    },
    {
      "timestamp": "2026-09-24T09:19:59.804Z",
      "receivedDate": "2026-09-22T18:30:00.000Z",
      "checkingDate": "2026-09-23T18:30:00.000Z",
      "date": "2026-09-23T18:30:00.000Z",
      "grn": 1349,
      "billNo": "TRF27KT/200334",
      "supplierName": "BLOSSOM INNERS PVT LTD - BANGLORE",
      "materialType": "Raw Material",
      "materialCategory": "Raw Material",
      "itemName": "THREAD GRAMAX PLSTR 18TX 5000MTRS\xA0AUTUMN COPPER",
      "receivedQuantity": 9,
      "checkedQuantity": 3,
      "passQuantity": 9,
      "rejectedQuantity": 0,
      "itemRemarks": "PASS",
      "generalRemarks": "PASS",
      "zone": "KERALA",
      "location": "KERALA",
      "inspector": "SONY LENIN",
      "id": "5c796448-8096-4999-b92a-e7c7453778be"
    },
    {
      "timestamp": "2026-09-24T09:19:59.804Z",
      "receivedDate": "2026-09-22T18:30:00.000Z",
      "checkingDate": "2026-09-23T18:30:00.000Z",
      "date": "2026-09-23T18:30:00.000Z",
      "grn": 1349,
      "billNo": "TRF27KT/200334",
      "supplierName": "BLOSSOM INNERS PVT LTD - BANGLORE",
      "materialType": "Raw Material",
      "materialCategory": "Raw Material",
      "itemName": "ELASTIC NARROW WOVEN FOLDING 77%NYLON 23%SPNDX 15MM SN312-15 DARK GREY",
      "receivedQuantity": 850,
      "checkedQuantity": 255,
      "passQuantity": 850,
      "rejectedQuantity": 0,
      "itemRemarks": "PASS",
      "generalRemarks": "PASS",
      "zone": "KERALA",
      "location": "KERALA",
      "inspector": "SONY LENIN",
      "id": "56e650c0-4b22-47b4-ae85-7b9cbd46f413"
    },
    {
      "timestamp": "2026-09-24T09:10:54.653Z",
      "receivedDate": "2026-09-22T18:30:00.000Z",
      "checkingDate": "2026-09-23T18:30:00.000Z",
      "date": "2026-09-23T18:30:00.000Z",
      "grn": 1348,
      "billNo": "TRF27KT/200336",
      "supplierName": "BLOSSOM INNERS PVT LTD - BANGLORE",
      "materialType": "Raw Material",
      "materialCategory": "Raw Material",
      "itemName": "ADJUSTER METAL COATED 12MM AUTUMN COPPER",
      "receivedQuantity": 7e3,
      "checkedQuantity": 2100,
      "passQuantity": 7e3,
      "rejectedQuantity": 0,
      "itemRemarks": "PASS",
      "generalRemarks": "PASS",
      "zone": "KERALA",
      "location": "KERALA",
      "inspector": "SONY LENIN",
      "id": "76167119-190a-44f4-b9d9-3973bd100504"
    },
    {
      "timestamp": "2026-09-23T06:10:56.952Z",
      "receivedDate": "2026-09-22T18:30:00.000Z",
      "checkingDate": "2026-09-22T18:30:00.000Z",
      "date": "2026-09-22T18:30:00.000Z",
      "grn": "I/R",
      "billNo": "G-0130/26-27",
      "supplierName": "BASKAR EMBROIDERY - TIRUPUR",
      "materialType": "Raw Material",
      "materialCategory": "Raw Material",
      "itemName": "HOOK-EYE 4X3 MICRO FIBER NYLON-55-60MM NON BRUSHED-RELUX NUDE",
      "receivedQuantity": 1500,
      "checkedQuantity": 450,
      "passQuantity": 1500,
      "rejectedQuantity": 0,
      "itemRemarks": "PASS",
      "generalRemarks": "",
      "zone": "KERALA",
      "location": "KERALA",
      "inspector": "SONY LENIN",
      "id": "42a6d612-2aa2-4ef2-bf90-6695cf2ce098"
    },
    {
      "timestamp": "2026-09-23T06:06:12.147Z",
      "receivedDate": "2026-09-17T18:30:00.000Z",
      "checkingDate": "2026-09-22T18:30:00.000Z",
      "date": "2026-09-22T18:30:00.000Z",
      "grn": 1322,
      "billNo": "TRF27KT/200330",
      "supplierName": "BLOSSOM INNERS PVT LTD - BANGLORE",
      "materialType": "Raw Material",
      "materialCategory": "Raw Material",
      "itemName": "BOW SATIN NYLON 6MM DARK GREY",
      "receivedQuantity": 1740,
      "checkedQuantity": 522,
      "passQuantity": 1740,
      "rejectedQuantity": 0,
      "itemRemarks": "PASS",
      "generalRemarks": "PASS",
      "zone": "KERALA",
      "location": "KERALA",
      "inspector": "SONY LENIN",
      "id": "1ff0299e-0258-4728-b10f-ffd8b23ef49d"
    },
    {
      "timestamp": "2026-09-23T06:06:12.147Z",
      "receivedDate": "2026-09-17T18:30:00.000Z",
      "checkingDate": "2026-09-22T18:30:00.000Z",
      "date": "2026-09-22T18:30:00.000Z",
      "grn": 1322,
      "billNo": "TRF27KT/200330",
      "supplierName": "BLOSSOM INNERS PVT LTD - BANGLORE",
      "materialType": "Raw Material",
      "materialCategory": "Raw Material",
      "itemName": "ELASTIC NARROW WOVEN BUFF 84%NYLON 16%SPNDX 14MM SN51-12\xA0DARK GERY",
      "receivedQuantity": 1526,
      "checkedQuantity": 457,
      "passQuantity": 1526,
      "rejectedQuantity": 0,
      "itemRemarks": "PASS",
      "generalRemarks": "PASS",
      "zone": "KERALA",
      "location": "KERALA",
      "inspector": "SONY LENIN",
      "id": "0015f65e-caf1-4984-bb87-281f5430010e"
    },
    {
      "timestamp": "2026-09-23T06:06:12.147Z",
      "receivedDate": "2026-09-17T18:30:00.000Z",
      "checkingDate": "2026-09-22T18:30:00.000Z",
      "date": "2026-09-22T18:30:00.000Z",
      "grn": 1322,
      "billNo": "TRF27KT/200330",
      "supplierName": "BLOSSOM INNERS PVT LTD - BANGLORE",
      "materialType": "Raw Material",
      "materialCategory": "Raw Material",
      "itemName": "ELASTIC NARROW WOVEN BUFF 84%NYLON 16%SPNDX 14MM SN51-14\xA0DARK GERY",
      "receivedQuantity": 1137,
      "checkedQuantity": 341,
      "passQuantity": 1137,
      "rejectedQuantity": 0,
      "itemRemarks": "PASS",
      "generalRemarks": "PASS",
      "zone": "KERALA",
      "location": "KERALA",
      "inspector": "SONY LENIN",
      "id": "cf6a378f-6ba3-4606-b2c6-9cbd9a2b49ce"
    },
    {
      "timestamp": "2026-09-23T06:06:12.147Z",
      "receivedDate": "2026-09-17T18:30:00.000Z",
      "checkingDate": "2026-09-22T18:30:00.000Z",
      "date": "2026-09-22T18:30:00.000Z",
      "grn": 1322,
      "billNo": "TRF27KT/200330",
      "supplierName": "BLOSSOM INNERS PVT LTD - BANGLORE",
      "materialType": "Raw Material",
      "materialCategory": "Raw Material",
      "itemName": "HOOK-EYE 2x3 MICRO FIBER NYLON-SS 32-60MM NON BRUSHED-RELUX DARK GREY",
      "receivedQuantity": 1340,
      "checkedQuantity": 402,
      "passQuantity": 1340,
      "rejectedQuantity": 0,
      "itemRemarks": "PASS",
      "generalRemarks": "PASS",
      "zone": "KERALA",
      "location": "KERALA",
      "inspector": "SONY LENIN",
      "id": "3baa72fd-52cd-4148-a45d-251065714381"
    },
    {
      "timestamp": "2026-09-23T06:06:12.147Z",
      "receivedDate": "2026-09-17T18:30:00.000Z",
      "checkingDate": "2026-09-22T18:30:00.000Z",
      "date": "2026-09-22T18:30:00.000Z",
      "grn": 1322,
      "billNo": "TRF27KT/200330",
      "supplierName": "BLOSSOM INNERS PVT LTD - BANGLORE",
      "materialType": "Raw Material",
      "materialCategory": "Raw Material",
      "itemName": "TAPE NARROW WOVEN BINDING 100%NYLON\xA0 18MM SN201-18 DARK GREY",
      "receivedQuantity": 975,
      "checkedQuantity": 292,
      "passQuantity": 975,
      "rejectedQuantity": 0,
      "itemRemarks": "PASS",
      "generalRemarks": "PASS",
      "zone": "KERALA",
      "location": "KERALA",
      "inspector": "SONY LENIN",
      "id": "5062d6c1-0bde-4c47-b82e-a75b04737bd1"
    },
    {
      "timestamp": "2026-09-23T06:06:12.147Z",
      "receivedDate": "2026-09-17T18:30:00.000Z",
      "checkingDate": "2026-09-22T18:30:00.000Z",
      "date": "2026-09-22T18:30:00.000Z",
      "grn": 1322,
      "billNo": "TRF27KT/200330",
      "supplierName": "BLOSSOM INNERS PVT LTD - BANGLORE",
      "materialType": "Raw Material",
      "materialCategory": "Raw Material",
      "itemName": "THREAD 3PLY PLSTR 24TX 5000MTRS DARK GREY",
      "receivedQuantity": 15,
      "checkedQuantity": 5,
      "passQuantity": 15,
      "rejectedQuantity": 0,
      "itemRemarks": "PASS",
      "generalRemarks": "PASS",
      "zone": "KERALA",
      "location": "KERALA",
      "inspector": "SONY LENIN",
      "id": "06407a7e-f80c-4659-8555-53679360bd62"
    },
    {
      "timestamp": "2026-09-23T06:06:12.147Z",
      "receivedDate": "2026-09-17T18:30:00.000Z",
      "checkingDate": "2026-09-22T18:30:00.000Z",
      "date": "2026-09-22T18:30:00.000Z",
      "grn": 1322,
      "billNo": "TRF27KT/200330",
      "supplierName": "BLOSSOM INNERS PVT LTD - BANGLORE",
      "materialType": "Raw Material",
      "materialCategory": "Raw Material",
      "itemName": "THREAD GRAMAX PLSTR 18TX 5000MTRS DARK GREY",
      "receivedQuantity": 9,
      "checkedQuantity": 3,
      "passQuantity": 9,
      "rejectedQuantity": 0,
      "itemRemarks": "PASS",
      "generalRemarks": "PASS",
      "zone": "KERALA",
      "location": "KERALA",
      "inspector": "SONY LENIN",
      "id": "6dd93c68-bc7d-4f9a-ae5f-9186f932d4b3"
    },
    {
      "timestamp": "2026-09-23T06:06:12.147Z",
      "receivedDate": "2026-09-17T18:30:00.000Z",
      "checkingDate": "2026-09-22T18:30:00.000Z",
      "date": "2026-09-22T18:30:00.000Z",
      "grn": 1322,
      "billNo": "TRF27KT/200330",
      "supplierName": "BLOSSOM INNERS PVT LTD - BANGLORE",
      "materialType": "Raw Material",
      "materialCategory": "Raw Material",
      "itemName": "HOOK-EYE 3x3 MICRO FIBER NYLON-SS 45-60MM NON BRUSHED-RELUX DARK GREY",
      "receivedQuantity": 400,
      "checkedQuantity": 120,
      "passQuantity": 400,
      "rejectedQuantity": 0,
      "itemRemarks": "PASS",
      "generalRemarks": "PASS",
      "zone": "KERALA",
      "location": "KERALA",
      "inspector": "SONY LENIN",
      "id": "5eb9efc0-bf42-4f37-8641-ba5eb9c07f47"
    },
    {
      "timestamp": "2026-09-22T11:51:25.763Z",
      "receivedDate": "2026-09-15T18:30:00.000Z",
      "checkingDate": "2026-09-21T18:30:00.000Z",
      "date": "2026-09-21T18:30:00.000Z",
      "grn": 1324,
      "billNo": "KIPL2627INVO2957",
      "supplierName": "KONIKA INTIMA PRIVATE LIMITED",
      "materialType": "Raw Material",
      "materialCategory": "Raw Material",
      "itemName": "ELASTIC NARROW WOVEN 84%NYLON 16% SPANDEX 32MM CORONET BLUE",
      "receivedQuantity": 750,
      "checkedQuantity": 225,
      "passQuantity": 750,
      "rejectedQuantity": 0,
      "itemRemarks": "PASS",
      "generalRemarks": "",
      "zone": "KERALA",
      "location": "KERALA",
      "inspector": "SONY LENIN",
      "id": "429d52bf-98dc-4991-a07b-f57abe5a6dcc"
    },
    {
      "timestamp": "2026-09-22T11:48:22.787Z",
      "receivedDate": "2026-09-15T18:30:00.000Z",
      "checkingDate": "2026-09-21T18:30:00.000Z",
      "date": "2026-09-21T18:30:00.000Z",
      "grn": 1323,
      "billNo": "KIPL2627INVO2915",
      "supplierName": "KONIKA INTIMA PRIVATE LIMITED",
      "materialType": "Raw Material",
      "materialCategory": "Raw Material",
      "itemName": "ELASTIC NARROW WOVEN 84%NYLON 16% SPANDEX 32MM SLATE",
      "receivedQuantity": 1e3,
      "checkedQuantity": 300,
      "passQuantity": 0,
      "rejectedQuantity": 0,
      "itemRemarks": "PASS",
      "generalRemarks": "",
      "zone": "KERALA",
      "location": "KERALA",
      "inspector": "SONY LENIN",
      "id": "5b7e6f32-be32-46f2-83f3-a2315ca88687"
    },
    {
      "timestamp": "2026-09-22T11:48:22.787Z",
      "receivedDate": "2026-09-15T18:30:00.000Z",
      "checkingDate": "2026-09-21T18:30:00.000Z",
      "date": "2026-09-21T18:30:00.000Z",
      "grn": 1323,
      "billNo": "KIPL2627INVO2915",
      "supplierName": "KONIKA INTIMA PRIVATE LIMITED",
      "materialType": "Raw Material",
      "materialCategory": "Raw Material",
      "itemName": "ELASTIC NARROW WOVEN 84%NYLON 16% SPANDEX 25MM MEDIEVAL BLUE",
      "receivedQuantity": 800,
      "checkedQuantity": 240,
      "passQuantity": 800,
      "rejectedQuantity": 0,
      "itemRemarks": "PASS",
      "generalRemarks": "",
      "zone": "KERALA",
      "location": "KERALA",
      "inspector": "SONY LENIN",
      "id": "0267580e-4a3c-48fd-be8a-c094cb8bdcdd"
    },
    {
      "timestamp": "2026-09-22T11:48:22.787Z",
      "receivedDate": "2026-09-15T18:30:00.000Z",
      "checkingDate": "2026-09-21T18:30:00.000Z",
      "date": "2026-09-21T18:30:00.000Z",
      "grn": 1323,
      "billNo": "KIPL2627INVO2915",
      "supplierName": "KONIKA INTIMA PRIVATE LIMITED",
      "materialType": "Raw Material",
      "materialCategory": "Raw Material",
      "itemName": "ELASTIC NARROW WOVEN 84%NYLON 16%SPANDEX 25MM SEPLA ROSE",
      "receivedQuantity": 1010,
      "checkedQuantity": 303,
      "passQuantity": 1010,
      "rejectedQuantity": 0,
      "itemRemarks": "PASS",
      "generalRemarks": "",
      "zone": "KERALA",
      "location": "KERALA",
      "inspector": "SONY LENIN",
      "id": "c568146f-249f-4396-b66e-c34a71819833"
    },
    {
      "timestamp": "2026-09-22T11:34:28.534Z",
      "receivedDate": "2026-08-31T18:30:00.000Z",
      "checkingDate": "2026-09-21T18:30:00.000Z",
      "date": "2026-09-21T18:30:00.000Z",
      "grn": 1216,
      "billNo": "2026-27/00603",
      "supplierName": "BTA ELASTICS",
      "materialType": "Raw Material",
      "materialCategory": "Raw Material",
      "itemName": "TAPE PLSTR JULIE LACE 10MM SEPLA ROSE",
      "receivedQuantity": 6800,
      "checkedQuantity": 6800,
      "passQuantity": 0,
      "rejectedQuantity": 6800,
      "itemRemarks": "REJECT",
      "generalRemarks": "DUE TO WIDTH VARIATION",
      "zone": "KERALA",
      "location": "KERALA",
      "inspector": "SONY LENIN",
      "id": "2e30ae48-203d-48ae-a6e4-8f3765eaaef7"
    },
    {
      "timestamp": "2026-09-22T11:34:28.534Z",
      "receivedDate": "2026-08-31T18:30:00.000Z",
      "checkingDate": "2026-09-21T18:30:00.000Z",
      "date": "2026-09-21T18:30:00.000Z",
      "grn": 1216,
      "billNo": "2026-27/00603",
      "supplierName": "BTA ELASTICS",
      "materialType": "Raw Material",
      "materialCategory": "Raw Material",
      "itemName": "TAPE PLSTR JULIE LACE 10MM CORONET BLUE",
      "receivedQuantity": 6800,
      "checkedQuantity": 6800,
      "passQuantity": 0,
      "rejectedQuantity": 6800,
      "itemRemarks": "REJECT",
      "generalRemarks": "DUE TO WIDTH VARIATION",
      "zone": "KERALA",
      "location": "KERALA",
      "inspector": "SONY LENIN",
      "id": "58b06951-4f98-4992-a95d-7f986fcea43f"
    },
    {
      "timestamp": "2026-09-22T11:34:28.534Z",
      "receivedDate": "2026-08-31T18:30:00.000Z",
      "checkingDate": "2026-09-21T18:30:00.000Z",
      "date": "2026-09-21T18:30:00.000Z",
      "grn": 1216,
      "billNo": "2026-27/00603",
      "supplierName": "BTA ELASTICS",
      "materialType": "Raw Material",
      "materialCategory": "Raw Material",
      "itemName": "TAPE PLSTR JULIE LACE 10MM SLATE",
      "receivedQuantity": 6800,
      "checkedQuantity": 6800,
      "passQuantity": 0,
      "rejectedQuantity": 6800,
      "itemRemarks": "REJECT",
      "generalRemarks": "DUE TO WIDTH VARIATION",
      "zone": "KERALA",
      "location": "KERALA",
      "inspector": "SONY LENIN",
      "id": "129f39c2-223f-44fe-8eec-e0bf5ca87e7a"
    },
    {
      "timestamp": "2026-09-19T09:28:50.512Z",
      "receivedDate": "2026-09-13T18:30:00.000Z",
      "checkingDate": "2026-09-18T18:30:00.000Z",
      "date": "2026-09-18T18:30:00.000Z",
      "grn": 1290,
      "billNo": 1720,
      "supplierName": "SACHINAM FABRICS PVT LTD",
      "materialType": "Raw Material",
      "materialCategory": "Raw Material",
      "itemName": "ELASTIC NARROW WOVEN FOLDING 77%NYLON 23%SPNDX 16MM WHITE",
      "receivedQuantity": 2e3,
      "checkedQuantity": 600,
      "passQuantity": 2e3,
      "rejectedQuantity": 0,
      "itemRemarks": "PASS",
      "generalRemarks": "PASS",
      "zone": "KERALA",
      "location": "KERALA",
      "inspector": "PRATHEEKSHA",
      "id": "4e4b1ce3-63d1-4004-b1e3-1c06e335763a"
    },
    {
      "timestamp": "2026-09-19T09:28:50.512Z",
      "receivedDate": "2026-09-13T18:30:00.000Z",
      "checkingDate": "2026-09-18T18:30:00.000Z",
      "date": "2026-09-18T18:30:00.000Z",
      "grn": 1290,
      "billNo": 1720,
      "supplierName": "SACHINAM FABRICS PVT LTD",
      "materialType": "Raw Material",
      "materialCategory": "Raw Material",
      "itemName": "ELASTIC MICRO NARROW WOVEN BUFF 84%NYLON 16%SPNDX 14MM\xA0 WHITE",
      "receivedQuantity": 21500,
      "checkedQuantity": 6450,
      "passQuantity": 21500,
      "rejectedQuantity": 0,
      "itemRemarks": "PASS",
      "generalRemarks": "PASS",
      "zone": "KERALA",
      "location": "KERALA",
      "inspector": "PRATHEEKSHA",
      "id": "b423c194-a472-4946-8bc9-987666408e4a"
    },
    {
      "timestamp": "2026-09-19T08:11:36.033Z",
      "receivedDate": "2026-09-17T18:30:00.000Z",
      "checkingDate": "2026-09-18T18:30:00.000Z",
      "date": "2026-09-18T18:30:00.000Z",
      "grn": 1315,
      "billNo": "P426020572",
      "supplierName": "Vardhaman Yarns and Threads Limited",
      "materialType": "Raw Material",
      "materialCategory": "Raw Material",
      "itemName": "THREAD TRILOBAL PLSTR 27TX 2000MTRS QUIAL",
      "receivedQuantity": 30,
      "checkedQuantity": 30,
      "passQuantity": 30,
      "rejectedQuantity": 0,
      "itemRemarks": "PASS",
      "generalRemarks": "PASS",
      "zone": "KERALA",
      "location": "KERALA",
      "inspector": "PRATHEEKSHA",
      "id": "7dc08169-cc7c-485a-a4d0-c48745a98f02"
    },
    {
      "timestamp": "2026-09-19T08:11:36.033Z",
      "receivedDate": "2026-09-17T18:30:00.000Z",
      "checkingDate": "2026-09-18T18:30:00.000Z",
      "date": "2026-09-18T18:30:00.000Z",
      "grn": 1315,
      "billNo": "P426020572",
      "supplierName": "Vardhaman Yarns and Threads Limited",
      "materialType": "Raw Material",
      "materialCategory": "Raw Material",
      "itemName": "THREAD TRILOBAL PLSTR 27TX 2000MTRS SLATE",
      "receivedQuantity": 30,
      "checkedQuantity": 30,
      "passQuantity": 30,
      "rejectedQuantity": 0,
      "itemRemarks": "PASS",
      "generalRemarks": "PASS",
      "zone": "KERALA",
      "location": "KERALA",
      "inspector": "PRATHEEKSHA",
      "id": "42490766-6488-4a5b-8ea2-9c827c20de81"
    },
    {
      "timestamp": "2026-09-19T08:11:36.033Z",
      "receivedDate": "2026-09-17T18:30:00.000Z",
      "checkingDate": "2026-09-18T18:30:00.000Z",
      "date": "2026-09-18T18:30:00.000Z",
      "grn": 1315,
      "billNo": "P426020572",
      "supplierName": "Vardhaman Yarns and Threads Limited",
      "materialType": "Raw Material",
      "materialCategory": "Raw Material",
      "itemName": "THREAD TRILOBAL PLSTR 27TX 2000MTRS NUDE",
      "receivedQuantity": 50,
      "checkedQuantity": 50,
      "passQuantity": 50,
      "rejectedQuantity": 0,
      "itemRemarks": "PASS",
      "generalRemarks": "PASS",
      "zone": "KERALA",
      "location": "KERALA",
      "inspector": "PRATHEEKSHA",
      "id": "7f7d8e9e-e21a-410e-bd8f-fb3fd2d8244b"
    },
    {
      "timestamp": "2026-09-19T08:11:36.033Z",
      "receivedDate": "2026-09-17T18:30:00.000Z",
      "checkingDate": "2026-09-18T18:30:00.000Z",
      "date": "2026-09-18T18:30:00.000Z",
      "grn": 1315,
      "billNo": "P426020572",
      "supplierName": "Vardhaman Yarns and Threads Limited",
      "materialType": "Raw Material",
      "materialCategory": "Raw Material",
      "itemName": "THREAD TRILOBAL PLSTR 27TX 2000MTRS WHITE",
      "receivedQuantity": 50,
      "checkedQuantity": 50,
      "passQuantity": 50,
      "rejectedQuantity": 0,
      "itemRemarks": "PASS",
      "generalRemarks": "PASS",
      "zone": "KERALA",
      "location": "KERALA",
      "inspector": "PRATHEEKSHA",
      "id": "b6ddf35f-f541-40e5-bc15-67afe7b48139"
    },
    {
      "timestamp": "2026-09-19T05:06:52.382Z",
      "receivedDate": "2026-09-14T18:30:00.000Z",
      "checkingDate": "2026-09-18T18:30:00.000Z",
      "date": "2026-09-18T18:30:00.000Z",
      "grn": 1293,
      "billNo": "U/1683",
      "supplierName": "POLYELASTIC P LTD",
      "materialType": "Raw Material",
      "materialCategory": "Raw Material",
      "itemName": "ELASTIC MICRO NARROW WOVEN BUFF 84%NYLON 16%SPNDX 14MM\xA0NUDE",
      "receivedQuantity": 23690,
      "checkedQuantity": 7107,
      "passQuantity": 23690,
      "rejectedQuantity": 0,
      "itemRemarks": "PASS",
      "generalRemarks": "PASS",
      "zone": "KERALA",
      "location": "KERALA",
      "inspector": "SONY LENIN",
      "id": "9208073e-6ebd-4bbc-b2af-3d954f5cc8de"
    },
    {
      "timestamp": "2026-09-19T05:06:52.382Z",
      "receivedDate": "2026-09-14T18:30:00.000Z",
      "checkingDate": "2026-09-18T18:30:00.000Z",
      "date": "2026-09-18T18:30:00.000Z",
      "grn": 1293,
      "billNo": "U/1683",
      "supplierName": "POLYELASTIC P LTD",
      "materialType": "Raw Material",
      "materialCategory": "Raw Material",
      "itemName": "ELASTIC MICRO NARROW WOVEN BUFF 84%NYLON 16%SPNDX 14MM\xA0 QUIAL",
      "receivedQuantity": 3870,
      "checkedQuantity": 1161,
      "passQuantity": 3870,
      "rejectedQuantity": 0,
      "itemRemarks": "PASS",
      "generalRemarks": "PASS",
      "zone": "KERALA",
      "location": "KERALA",
      "inspector": "SONY LENIN",
      "id": "00f61772-21d3-4620-b302-7302686fa9f2"
    },
    {
      "timestamp": "2026-09-19T04:50:01.056Z",
      "receivedDate": "2026-09-15T18:30:00.000Z",
      "checkingDate": "2026-09-18T18:30:00.000Z",
      "date": "2026-09-18T18:30:00.000Z",
      "grn": 1310,
      "billNo": 11511,
      "supplierName": "SIVAM TRADERS",
      "materialType": "Raw Material",
      "materialCategory": "Raw Material",
      "itemName": "THREAD 3PLY PLSTR 24TX 5000MTRS WHITE",
      "receivedQuantity": 100,
      "checkedQuantity": 100,
      "passQuantity": 100,
      "rejectedQuantity": 0,
      "itemRemarks": "PASS",
      "generalRemarks": "PASS",
      "zone": "KERALA",
      "location": "KERALA",
      "inspector": "PRATHEEKSHA",
      "id": "512328ea-a731-4808-a4a0-3fe809cac749"
    },
    {
      "timestamp": "2026-09-17T09:32:35.361Z",
      "receivedDate": "2026-09-16T18:30:00.000Z",
      "checkingDate": "2026-09-16T18:30:00.000Z",
      "date": "2026-09-16T18:30:00.000Z",
      "grn": "I/R",
      "billNo": "G-0129/26-27",
      "supplierName": "BASKAR EMBROIDERY - TIRUPUR",
      "materialType": "Raw Material",
      "materialCategory": "Raw Material",
      "itemName": "HOOK-EYE 4x3 MICRO FIBER NYLON-SS 55-57MM NON BRUSHED-RELUX WHITE",
      "receivedQuantity": 1476,
      "checkedQuantity": 443,
      "passQuantity": 1476,
      "rejectedQuantity": 0,
      "itemRemarks": "PASS",
      "generalRemarks": "",
      "zone": "KERALA",
      "location": "KERALA",
      "inspector": "SONY LENIN",
      "id": "1100ebbb-1c67-4f42-bb49-1deeadfdd8cd"
    },
    {
      "timestamp": "2026-09-17T06:45:45.299Z",
      "receivedDate": "2026-09-13T18:30:00.000Z",
      "checkingDate": "2026-09-16T18:30:00.000Z",
      "date": "2026-09-16T18:30:00.000Z",
      "grn": 1289,
      "billNo": "E126009397",
      "supplierName": "Vardhaman Yarns and Threads Limited",
      "materialType": "Raw Material",
      "materialCategory": "Raw Material",
      "itemName": "THREAD CTN 20S 1000 BURL WOOD",
      "receivedQuantity": 10,
      "checkedQuantity": 10,
      "passQuantity": 10,
      "rejectedQuantity": 0,
      "itemRemarks": "PASS",
      "generalRemarks": "PASS",
      "zone": "KERALA",
      "location": "KERALA",
      "inspector": "PRATHEEKSHA",
      "id": "22376584-20e6-4ca4-8915-86c3f3e607d5"
    },
    {
      "timestamp": "2026-09-17T06:45:45.299Z",
      "receivedDate": "2026-09-13T18:30:00.000Z",
      "checkingDate": "2026-09-16T18:30:00.000Z",
      "date": "2026-09-16T18:30:00.000Z",
      "grn": 1289,
      "billNo": "E126009397",
      "supplierName": "Vardhaman Yarns and Threads Limited",
      "materialType": "Raw Material",
      "materialCategory": "Raw Material",
      "itemName": "THREAD CTN 20S 1000 DEEP TAUPE",
      "receivedQuantity": 10,
      "checkedQuantity": 10,
      "passQuantity": 10,
      "rejectedQuantity": 0,
      "itemRemarks": "PASS",
      "generalRemarks": "PASS",
      "zone": "KERALA",
      "location": "KERALA",
      "inspector": "PRATHEEKSHA",
      "id": "3d203ad9-988b-4f38-9299-1cd14b6db1ae"
    },
    {
      "timestamp": "2026-09-17T06:36:11.951Z",
      "receivedDate": "2026-09-13T18:30:00.000Z",
      "checkingDate": "2026-09-16T18:30:00.000Z",
      "date": "2026-09-16T18:30:00.000Z",
      "grn": 1288,
      "billNo": "E126009396",
      "supplierName": "Vardhaman Yarns and Threads Limited",
      "materialType": "Raw Material",
      "materialCategory": "Raw Material",
      "itemName": "THREAD CTN 20S 1000 MAROON",
      "receivedQuantity": 30,
      "checkedQuantity": 30,
      "passQuantity": 30,
      "rejectedQuantity": 0,
      "itemRemarks": "PASS",
      "generalRemarks": "PASS",
      "zone": "KERALA",
      "location": "KERALA",
      "inspector": "PRATHEEKSHA",
      "id": "403c112d-bce0-44bf-9d33-15025bb8392f"
    },
    {
      "timestamp": "2026-09-17T06:36:11.951Z",
      "receivedDate": "2026-09-13T18:30:00.000Z",
      "checkingDate": "2026-09-16T18:30:00.000Z",
      "date": "2026-09-16T18:30:00.000Z",
      "grn": 1288,
      "billNo": "E126009396",
      "supplierName": "Vardhaman Yarns and Threads Limited",
      "materialType": "Raw Material",
      "materialCategory": "Raw Material",
      "itemName": "THREAD CTN 20S 1000 MEDIEVAL BLUE",
      "receivedQuantity": 30,
      "checkedQuantity": 30,
      "passQuantity": 30,
      "rejectedQuantity": 0,
      "itemRemarks": "PASS",
      "generalRemarks": "PASS",
      "zone": "KERALA",
      "location": "KERALA",
      "inspector": "PRATHEEKSHA",
      "id": "759cbca5-9bc4-4519-8cc5-a16107cfadb7"
    },
    {
      "timestamp": "2026-09-17T06:36:11.951Z",
      "receivedDate": "2026-09-13T18:30:00.000Z",
      "checkingDate": "2026-09-16T18:30:00.000Z",
      "date": "2026-09-16T18:30:00.000Z",
      "grn": 1288,
      "billNo": "E126009396",
      "supplierName": "Vardhaman Yarns and Threads Limited",
      "materialType": "Raw Material",
      "materialCategory": "Raw Material",
      "itemName": "THREAD CTN 20S 1000 SLATE",
      "receivedQuantity": 30,
      "checkedQuantity": 30,
      "passQuantity": 30,
      "rejectedQuantity": 0,
      "itemRemarks": "PASS",
      "generalRemarks": "PASS",
      "zone": "KERALA",
      "location": "KERALA",
      "inspector": "PRATHEEKSHA",
      "id": "4c7b22b3-c46f-405f-afe2-8f5269a2464f"
    },
    {
      "timestamp": "2026-09-17T06:36:11.951Z",
      "receivedDate": "2026-09-13T18:30:00.000Z",
      "checkingDate": "2026-09-16T18:30:00.000Z",
      "date": "2026-09-16T18:30:00.000Z",
      "grn": 1288,
      "billNo": "E126009396",
      "supplierName": "Vardhaman Yarns and Threads Limited",
      "materialType": "Raw Material",
      "materialCategory": "Raw Material",
      "itemName": "THREAD CTN 20S 1000 SEPLA ROSE",
      "receivedQuantity": 30,
      "checkedQuantity": 30,
      "passQuantity": 30,
      "rejectedQuantity": 0,
      "itemRemarks": "PASS",
      "generalRemarks": "PASS",
      "zone": "KERALA",
      "location": "KERALA",
      "inspector": "PRATHEEKSHA",
      "id": "9ee0c017-c6ce-4cb3-9787-f5ebf64345c0"
    },
    {
      "timestamp": "2026-09-17T06:36:11.951Z",
      "receivedDate": "2026-09-13T18:30:00.000Z",
      "checkingDate": "2026-09-16T18:30:00.000Z",
      "date": "2026-09-16T18:30:00.000Z",
      "grn": 1288,
      "billNo": "E126009396",
      "supplierName": "Vardhaman Yarns and Threads Limited",
      "materialType": "Raw Material",
      "materialCategory": "Raw Material",
      "itemName": "THREAD CTN 20S 1000 NUDE",
      "receivedQuantity": 100,
      "checkedQuantity": 100,
      "passQuantity": 100,
      "rejectedQuantity": 0,
      "itemRemarks": "PASS",
      "generalRemarks": "PASS",
      "zone": "KERALA",
      "location": "KERALA",
      "inspector": "PRATHEEKSHA",
      "id": "113cf051-59a5-4a0f-a7e3-0e3a1a95fc11"
    },
    {
      "timestamp": "2026-09-16T08:17:05.108Z",
      "receivedDate": "2026-09-06T18:30:00.000Z",
      "checkingDate": "2026-09-15T18:30:00.000Z",
      "date": "2026-09-15T18:30:00.000Z",
      "grn": 1292,
      "billNo": "KE/891",
      "supplierName": "KAKADIYA ENTERPRISE",
      "materialType": "Raw Material",
      "materialCategory": "Raw Material",
      "itemName": "ELASTIC MICRO NARROW WOVEN BUFF 84%NYLON 16%SPNDX 14MM\xA0 WHITE",
      "receivedQuantity": 20500,
      "checkedQuantity": 6150,
      "passQuantity": 20500,
      "rejectedQuantity": 0,
      "itemRemarks": "PASS",
      "generalRemarks": "PASS",
      "zone": "KERALA",
      "location": "KERALA",
      "inspector": "SONY LENIN",
      "id": "8899a7d7-0af5-4a0d-a4e0-46792050bc9a"
    },
    {
      "timestamp": "2026-09-16T08:17:05.108Z",
      "receivedDate": "2026-09-06T18:30:00.000Z",
      "checkingDate": "2026-09-15T18:30:00.000Z",
      "date": "2026-09-15T18:30:00.000Z",
      "grn": 1292,
      "billNo": "KE/891",
      "supplierName": "KAKADIYA ENTERPRISE",
      "materialType": "Raw Material",
      "materialCategory": "Raw Material",
      "itemName": "ELASTIC MICRO NARROW WOVEN BUFF 84%NYLON 16%SPNDX 14MM\xA0 DEEP TAPUE",
      "receivedQuantity": 4e3,
      "checkedQuantity": 1200,
      "passQuantity": 4e3,
      "rejectedQuantity": 0,
      "itemRemarks": "PASS",
      "generalRemarks": "PASS",
      "zone": "KERALA",
      "location": "KERALA",
      "inspector": "SONY LENIN",
      "id": "5d40c82b-c774-4356-b4b0-c7989040b653"
    },
    {
      "timestamp": "2026-09-16T07:34:00.447Z",
      "receivedDate": "2026-09-13T18:30:00.000Z",
      "checkingDate": "2026-09-15T18:30:00.000Z",
      "date": "2026-09-15T18:30:00.000Z",
      "grn": 1291,
      "billNo": 1766,
      "supplierName": "SACHINAM FABRICS PVT LTD",
      "materialType": "Raw Material",
      "materialCategory": "Raw Material",
      "itemName": "ELASTIC MICRO NARROW WOVEN BUFF 84%NYLON 16%SPNDX 14MM MAUVE",
      "receivedQuantity": 9292,
      "checkedQuantity": 2787.6,
      "passQuantity": 9290,
      "rejectedQuantity": 0,
      "itemRemarks": "PASS",
      "generalRemarks": "PASS",
      "zone": "KERALA",
      "location": "KERALA",
      "inspector": "PRATHEEKSHA",
      "id": "45d43740-4b07-4c30-a1a5-9416b29675ae"
    },
    {
      "timestamp": "2026-09-16T07:34:00.447Z",
      "receivedDate": "2026-09-13T18:30:00.000Z",
      "checkingDate": "2026-09-15T18:30:00.000Z",
      "date": "2026-09-15T18:30:00.000Z",
      "grn": 1291,
      "billNo": 1766,
      "supplierName": "SACHINAM FABRICS PVT LTD",
      "materialType": "Raw Material",
      "materialCategory": "Raw Material",
      "itemName": "ELASTIC MICRO NARROW WOVEN BUFF 84%NYLON 16%SPNDX 14MM\xA0NUDE",
      "receivedQuantity": 42e3,
      "checkedQuantity": 12600,
      "passQuantity": 42e3,
      "rejectedQuantity": 0,
      "itemRemarks": "PASS",
      "generalRemarks": "PASS",
      "zone": "KERALA",
      "location": "KERALA",
      "inspector": "PRATHEEKSHA",
      "id": "75800bef-90a8-48b5-9305-b6e8fd68fb8b"
    },
    {
      "timestamp": "2026-09-16T07:31:09.406Z",
      "receivedDate": "2026-09-13T18:30:00.000Z",
      "checkingDate": "2026-09-15T18:30:00.000Z",
      "date": "2026-09-15T18:30:00.000Z",
      "grn": 1283,
      "billNo": "KIPL2627INVO2847",
      "supplierName": "KONIKA INTIMA PRIVATE LIMITED",
      "materialType": "Raw Material",
      "materialCategory": "Raw Material",
      "itemName": "ELASTIC NARROW WOVEN 84%NYLON 16%SPANDEX 32MM BURL WOOD",
      "receivedQuantity": 1020,
      "checkedQuantity": 306,
      "passQuantity": 1020,
      "rejectedQuantity": 0,
      "itemRemarks": "PASS",
      "generalRemarks": "PASS",
      "zone": "KERALA",
      "location": "KERALA",
      "inspector": "PRATHEEKSHA",
      "id": "4993bc80-eebe-4489-a702-51056fa3d051"
    },
    {
      "timestamp": "2026-09-16T07:29:07.815Z",
      "receivedDate": "2026-09-13T18:30:00.000Z",
      "checkingDate": "2026-09-15T18:30:00.000Z",
      "date": "2026-09-15T18:30:00.000Z",
      "grn": 1284,
      "billNo": "KIPL2627INVO2881",
      "supplierName": "KONIKA INTIMA PRIVATE LIMITED",
      "materialType": "Raw Material",
      "materialCategory": "Raw Material",
      "itemName": "ELASTIC NARROW WOVEN 84%NYLON 16%SPANDEX 32MM DEEP TAUPE",
      "receivedQuantity": 920,
      "checkedQuantity": 276,
      "passQuantity": 920,
      "rejectedQuantity": 0,
      "itemRemarks": "PASS",
      "generalRemarks": "PASS",
      "zone": "KERALA",
      "location": "KERALA",
      "inspector": "PRATHEEKSHA",
      "id": "9bdd0857-3409-4df0-a723-6c5c4f01594a"
    },
    {
      "timestamp": "2026-09-16T07:29:07.815Z",
      "receivedDate": "2026-09-13T18:30:00.000Z",
      "checkingDate": "2026-09-15T18:30:00.000Z",
      "date": "2026-09-15T18:30:00.000Z",
      "grn": 1284,
      "billNo": "KIPL2627INVO2881",
      "supplierName": "KONIKA INTIMA PRIVATE LIMITED",
      "materialType": "Raw Material",
      "materialCategory": "Raw Material",
      "itemName": "ELASTIC NARROW WOVEN 84%NYLON 16%SPANDEX 32MM QUIAL",
      "receivedQuantity": 920,
      "checkedQuantity": 276,
      "passQuantity": 920,
      "rejectedQuantity": 0,
      "itemRemarks": "PASS",
      "generalRemarks": "PASS",
      "zone": "KERALA",
      "location": "KERALA",
      "inspector": "PRATHEEKSHA",
      "id": "e2f3f53d-a30f-40ba-b91e-72b6feda9fd3"
    },
    {
      "timestamp": "2026-09-16T07:24:43.296Z",
      "receivedDate": "2026-09-13T18:30:00.000Z",
      "checkingDate": "2026-09-15T18:30:00.000Z",
      "date": "2026-09-15T18:30:00.000Z",
      "grn": 1285,
      "billNo": "KPIL2627INVO2872",
      "supplierName": "KONIKA INTIMA PRIVATE LIMITED",
      "materialType": "Raw Material",
      "materialCategory": "Raw Material",
      "itemName": "ELASTIC NARROW WOVEN 84%NYLON 16%SPANDEX 25MM SLATE",
      "receivedQuantity": 1040,
      "checkedQuantity": 312,
      "passQuantity": 1040,
      "rejectedQuantity": 0,
      "itemRemarks": "PASS",
      "generalRemarks": "",
      "zone": "KERALA",
      "location": "KERALA",
      "inspector": "PRATHEEKSHA",
      "id": "da3b1cbf-5869-40b3-9d60-0569932c24f6"
    },
    {
      "timestamp": "2026-09-16T07:24:43.296Z",
      "receivedDate": "2026-09-13T18:30:00.000Z",
      "checkingDate": "2026-09-15T18:30:00.000Z",
      "date": "2026-09-15T18:30:00.000Z",
      "grn": 1285,
      "billNo": "KPIL2627INVO2872",
      "supplierName": "KONIKA INTIMA PRIVATE LIMITED",
      "materialType": "Raw Material",
      "materialCategory": "Raw Material",
      "itemName": "ELASTIC NARROW WOVEN ARROW 84%NYLON 16%SPANDEX 25MM NUDE",
      "receivedQuantity": 2700,
      "checkedQuantity": 810,
      "passQuantity": 2700,
      "rejectedQuantity": 0,
      "itemRemarks": "PASS",
      "generalRemarks": "",
      "zone": "KERALA",
      "location": "KERALA",
      "inspector": "PRATHEEKSHA",
      "id": "3e2ea52f-a0c5-4e77-835e-179cd9104bde"
    },
    {
      "timestamp": "2026-09-12T05:42:42.903Z",
      "receivedDate": "2026-09-10T18:30:00.000Z",
      "checkingDate": "2026-09-11T18:30:00.000Z",
      "date": "2026-09-11T18:30:00.000Z",
      "grn": "I/R",
      "billNo": "G-0125 / 26-27",
      "supplierName": "BASKAR EMBROIDERY - TIRUPUR",
      "materialType": "Raw Material",
      "materialCategory": "Raw Material",
      "itemName": "HOOK-EYE 2x3 MICRO FIBER NYLON-SS 32-60MM NON BRUSHED-RELUX QUIAL",
      "receivedQuantity": 4800,
      "checkedQuantity": 1440,
      "passQuantity": 4800,
      "rejectedQuantity": 0,
      "itemRemarks": "PASS",
      "generalRemarks": "PASS",
      "zone": "KERALA",
      "location": "KERALA",
      "inspector": "SONY LENIN",
      "id": "6a9b1265-eb3c-4929-9675-3d7040e7aa98"
    },
    {
      "timestamp": "2026-09-10T08:19:46.305Z",
      "receivedDate": "2026-09-09T18:30:00.000Z",
      "checkingDate": "2026-09-09T18:30:00.000Z",
      "date": "2026-09-09T18:30:00.000Z",
      "grn": 1259,
      "billNo": "TRF27KT/200317",
      "supplierName": "BLOSSOM INNERS PVT LTD - BANGLORE",
      "materialType": "Raw Material",
      "materialCategory": "Raw Material",
      "itemName": "CLOTH KTD INTRL 52% CTN 48% PLSTR 40s 220GSM 36INCH TUBULAR WIDTH BIO FINISH GREY",
      "receivedQuantity": 9.8,
      "checkedQuantity": 9.8,
      "passQuantity": 9.8,
      "rejectedQuantity": 0,
      "itemRemarks": "PASS",
      "generalRemarks": "PASS",
      "zone": "KERALA",
      "location": "KERALA",
      "inspector": "PRATHEEKSHA",
      "id": "5612cc42-fb11-491a-8008-8c7b5a1d10a4"
    },
    {
      "timestamp": "2026-09-10T06:56:02.764Z",
      "receivedDate": "2026-09-07T18:30:00.000Z",
      "checkingDate": "2026-09-09T18:30:00.000Z",
      "date": "2026-09-09T18:30:00.000Z",
      "grn": 1244,
      "billNo": "TRF27KT/200311",
      "supplierName": "BLOSSOM INNERS PVT LTD - BANGLORE",
      "materialType": "Raw Material",
      "materialCategory": "Raw Material",
      "itemName": "CLOTH KTD INTRL 52% CTN 48% PLSTR 40s 220GSM 36INCH TUBULAR WIDTH BIO FINISH GREY",
      "receivedQuantity": 58.29,
      "checkedQuantity": 58.29,
      "passQuantity": 58.29,
      "rejectedQuantity": 0,
      "itemRemarks": "PASS",
      "generalRemarks": "PASS",
      "zone": "KERALA",
      "location": "KERALA",
      "inspector": "PRATHEEKSHA",
      "id": "0093d876-8e4e-4fa1-9b6f-1d1e82a36c1c"
    },
    {
      "timestamp": "2026-09-10T06:56:02.764Z",
      "receivedDate": "2026-09-07T18:30:00.000Z",
      "checkingDate": "2026-09-09T18:30:00.000Z",
      "date": "2026-09-09T18:30:00.000Z",
      "grn": 1244,
      "billNo": "TRF27KT/200311",
      "supplierName": "BLOSSOM INNERS PVT LTD - BANGLORE",
      "materialType": "Raw Material",
      "materialCategory": "Raw Material",
      "itemName": "CLOTH KTD INTRL 52% CTN 48%\xA0PLSTR\xA040s 220GSM BIO FINISH 36INCH TUBULAR WIDTH ASH ROSE",
      "receivedQuantity": 68.91,
      "checkedQuantity": 68.91,
      "passQuantity": 68.91,
      "rejectedQuantity": 0,
      "itemRemarks": "PASS",
      "generalRemarks": "PASS",
      "zone": "KERALA",
      "location": "KERALA",
      "inspector": "PRATHEEKSHA",
      "id": "ec9aff43-3095-4272-a81f-c72da8da99f7"
    },
    {
      "timestamp": "2026-09-10T06:56:02.764Z",
      "receivedDate": "2026-09-07T18:30:00.000Z",
      "checkingDate": "2026-09-09T18:30:00.000Z",
      "date": "2026-09-09T18:30:00.000Z",
      "grn": 1244,
      "billNo": "TRF27KT/200311",
      "supplierName": "BLOSSOM INNERS PVT LTD - BANGLORE",
      "materialType": "Raw Material",
      "materialCategory": "Raw Material",
      "itemName": "CLOTH KTD INTRL 52% CTN 48%\xA0PLSTR\xA040s 220GSM BIO FINISH 36INCH TUBULAR WIDTH DARK GREY",
      "receivedQuantity": 68.91,
      "checkedQuantity": 68.91,
      "passQuantity": 68.91,
      "rejectedQuantity": 0,
      "itemRemarks": "PASS",
      "generalRemarks": "PASS",
      "zone": "KERALA",
      "location": "KERALA",
      "inspector": "PRATHEEKSHA",
      "id": "792c45a3-90d5-4966-b048-9615682a8f70"
    },
    {
      "timestamp": "2026-09-10T06:56:02.764Z",
      "receivedDate": "2026-09-07T18:30:00.000Z",
      "checkingDate": "2026-09-09T18:30:00.000Z",
      "date": "2026-09-09T18:30:00.000Z",
      "grn": 1244,
      "billNo": "TRF27KT/200311",
      "supplierName": "BLOSSOM INNERS PVT LTD - BANGLORE",
      "materialType": "Raw Material",
      "materialCategory": "Raw Material",
      "itemName": "CLOTH KTD INTRL 52% CTN 48%\xA0PLSTR\xA040s 220GSM BIO FINISH 36INCH TUBULAR WIDTH HEDGE GREEN",
      "receivedQuantity": 68.91,
      "checkedQuantity": 68.91,
      "passQuantity": 68.91,
      "rejectedQuantity": 0,
      "itemRemarks": "PASS",
      "generalRemarks": "PASS",
      "zone": "KERALA",
      "location": "KERALA",
      "inspector": "PRATHEEKSHA",
      "id": "7c3c389c-8f80-4766-b479-c114600bd59b"
    },
    {
      "timestamp": "2026-09-09T09:48:53.341Z",
      "receivedDate": "2026-09-06T18:30:00.000Z",
      "checkingDate": "2026-09-08T18:30:00.000Z",
      "date": "2026-09-08T18:30:00.000Z",
      "grn": 1233,
      "billNo": "KE/850",
      "supplierName": "KAKADIYA ENTERPRISE",
      "materialType": "Raw Material",
      "materialCategory": "Raw Material",
      "itemName": "ELASTIC MICRO NARROW WOVEN BUFF 84%NYLON 16%SPNDX 12MM\xA0 BURL WOOD",
      "receivedQuantity": 5100,
      "checkedQuantity": 1530,
      "passQuantity": 5100,
      "rejectedQuantity": 0,
      "itemRemarks": "PASS",
      "generalRemarks": "PASS",
      "zone": "KERALA",
      "location": "KERALA",
      "inspector": "PRATHEEKSHA",
      "id": "da3c0189-7824-4f26-b01f-4dcd1806d5b8"
    },
    {
      "timestamp": "2026-09-09T09:48:53.341Z",
      "receivedDate": "2026-09-06T18:30:00.000Z",
      "checkingDate": "2026-09-08T18:30:00.000Z",
      "date": "2026-09-08T18:30:00.000Z",
      "grn": 1233,
      "billNo": "KE/850",
      "supplierName": "KAKADIYA ENTERPRISE",
      "materialType": "Raw Material",
      "materialCategory": "Raw Material",
      "itemName": "ELASTIC MICRO NARROW WOVEN BUFF 84%NYLON 16%SPNDX 14MM BURL WOOD",
      "receivedQuantity": 1e4,
      "checkedQuantity": 3e3,
      "passQuantity": 1e4,
      "rejectedQuantity": 0,
      "itemRemarks": "PASS",
      "generalRemarks": "PASS",
      "zone": "KERALA",
      "location": "KERALA",
      "inspector": "PRATHEEKSHA",
      "id": "0a316a88-39f7-4f84-b7a4-d96be3b48e07"
    },
    {
      "timestamp": "2026-09-09T09:48:53.341Z",
      "receivedDate": "2026-09-06T18:30:00.000Z",
      "checkingDate": "2026-09-08T18:30:00.000Z",
      "date": "2026-09-08T18:30:00.000Z",
      "grn": 1233,
      "billNo": "KE/850",
      "supplierName": "KAKADIYA ENTERPRISE",
      "materialType": "Raw Material",
      "materialCategory": "Raw Material",
      "itemName": "ELASTIC MICRO NARROW WOVEN BUFF 84%NYLON 16%SPNDX 14MM BURL WOOD",
      "receivedQuantity": 4e3,
      "checkedQuantity": 1200,
      "passQuantity": 4e3,
      "rejectedQuantity": 0,
      "itemRemarks": "PASS",
      "generalRemarks": "PASS",
      "zone": "KERALA",
      "location": "KERALA",
      "inspector": "PRATHEEKSHA",
      "id": "258fe5b8-4257-49b1-a006-da7cd7dc8f6a"
    },
    {
      "timestamp": "2026-09-09T09:48:53.341Z",
      "receivedDate": "2026-09-06T18:30:00.000Z",
      "checkingDate": "2026-09-08T18:30:00.000Z",
      "date": "2026-09-08T18:30:00.000Z",
      "grn": 1233,
      "billNo": "KE/850",
      "supplierName": "KAKADIYA ENTERPRISE",
      "materialType": "Raw Material",
      "materialCategory": "Raw Material",
      "itemName": "ELASTIC MICRO NARROW WOVEN BUFF 84%NYLON 16%SPNDX 14MM\xA0NUDE",
      "receivedQuantity": 11500,
      "checkedQuantity": 3500,
      "passQuantity": 11500,
      "rejectedQuantity": 0,
      "itemRemarks": "PASS",
      "generalRemarks": "PASS",
      "zone": "KERALA",
      "location": "KERALA",
      "inspector": "PRATHEEKSHA",
      "id": "d97c34d0-fe41-4c34-a820-b3b456dacb0f"
    },
    {
      "timestamp": "2026-09-09T09:48:53.341Z",
      "receivedDate": "2026-09-06T18:30:00.000Z",
      "checkingDate": "2026-09-08T18:30:00.000Z",
      "date": "2026-09-08T18:30:00.000Z",
      "grn": 1233,
      "billNo": "KE/850",
      "supplierName": "KAKADIYA ENTERPRISE",
      "materialType": "Raw Material",
      "materialCategory": "Raw Material",
      "itemName": "ELASTIC MICRO NARROW WOVEN BUFF 84%NYLON 16%SPNDX 14MM\xA0 WHITE",
      "receivedQuantity": 6e3,
      "checkedQuantity": 1800,
      "passQuantity": 6e3,
      "rejectedQuantity": 0,
      "itemRemarks": "PASS",
      "generalRemarks": "PASS",
      "zone": "KERALA",
      "location": "KERALA",
      "inspector": "PRATHEEKSHA",
      "id": "f2664feb-8d74-4fc1-87d1-86febb0cfb37"
    },
    {
      "timestamp": "2026-09-09T09:48:53.341Z",
      "receivedDate": "2026-09-06T18:30:00.000Z",
      "checkingDate": "2026-09-08T18:30:00.000Z",
      "date": "2026-09-08T18:30:00.000Z",
      "grn": 1233,
      "billNo": "KE/850",
      "supplierName": "KAKADIYA ENTERPRISE",
      "materialType": "Raw Material",
      "materialCategory": "Raw Material",
      "itemName": "ELASTIC MICRO NARROW WOVEN BUFF 84%NYLON 16%SPNDX 18MM NUDE",
      "receivedQuantity": 3850,
      "checkedQuantity": 1050,
      "passQuantity": 3850,
      "rejectedQuantity": 0,
      "itemRemarks": "PASS",
      "generalRemarks": "PASS",
      "zone": "KERALA",
      "location": "KERALA",
      "inspector": "PRATHEEKSHA",
      "id": "9ebfd9ee-abcd-410a-a545-05b7f07d6e1b"
    },
    {
      "timestamp": "2026-09-08T08:22:08.206Z",
      "receivedDate": "2026-09-03T18:30:00.000Z",
      "checkingDate": "2026-09-07T18:30:00.000Z",
      "date": "2026-09-07T18:30:00.000Z",
      "grn": "I/R",
      "billNo": "G-0121 / 26-27",
      "supplierName": "BASKAR EMBROIDERY - TIRUPUR",
      "materialType": "Raw Material",
      "materialCategory": "Raw Material",
      "itemName": "HOOK-EYE 3x3 MICRO FIBER NYLON-SS 45-60MM NON BRUSHED-RELUX BURL WOOD",
      "receivedQuantity": 3380,
      "checkedQuantity": 1014,
      "passQuantity": 3380,
      "rejectedQuantity": 0,
      "itemRemarks": "PASS",
      "generalRemarks": "PASS",
      "zone": "KERALA",
      "location": "KERALA",
      "inspector": "PRATHEEKSHA",
      "id": "df9783ad-1db8-4d4f-baf0-4e9f101fa7f2"
    },
    {
      "timestamp": "2026-09-08T08:22:08.206Z",
      "receivedDate": "2026-09-03T18:30:00.000Z",
      "checkingDate": "2026-09-07T18:30:00.000Z",
      "date": "2026-09-07T18:30:00.000Z",
      "grn": "I/R",
      "billNo": "G-0121 / 26-27",
      "supplierName": "BASKAR EMBROIDERY - TIRUPUR",
      "materialType": "Raw Material",
      "materialCategory": "Raw Material",
      "itemName": "HOOK-EYE 2x3 MICRO FIBER NYLON-SS 32-60MM NON BRUSHED-RELUX BURL WOOD",
      "receivedQuantity": 3420,
      "checkedQuantity": 1026,
      "passQuantity": 3420,
      "rejectedQuantity": 0,
      "itemRemarks": "PASS",
      "generalRemarks": "PASS",
      "zone": "KERALA",
      "location": "KERALA",
      "inspector": "PRATHEEKSHA",
      "id": "52f9968e-de4c-4f9a-b031-8447e2877e9a"
    },
    {
      "timestamp": "2026-09-08T04:56:52.755Z",
      "receivedDate": "2026-08-30T18:30:00.000Z",
      "checkingDate": "2026-09-07T18:30:00.000Z",
      "date": "2026-09-07T18:30:00.000Z",
      "grn": 1226,
      "billNo": "KE/796",
      "supplierName": "KAKADIYA ENTERPRISE",
      "materialType": "Raw Material",
      "materialCategory": "Raw Material",
      "itemName": "ELASTIC MICRO NARROW WOVEN BUFF 84%NYLON 16%SPNDX 12MM\xA0 DEEP TAUPE",
      "receivedQuantity": 1500,
      "checkedQuantity": 450,
      "passQuantity": 1500,
      "rejectedQuantity": 0,
      "itemRemarks": "PASS",
      "generalRemarks": "Pass",
      "zone": "KERALA",
      "location": "KERALA",
      "inspector": "SONY LENIN",
      "id": "3bdfd445-eead-4d02-a3f9-0b728c7eb303"
    },
    {
      "timestamp": "2026-09-08T04:56:52.755Z",
      "receivedDate": "2026-08-30T18:30:00.000Z",
      "checkingDate": "2026-09-07T18:30:00.000Z",
      "date": "2026-09-07T18:30:00.000Z",
      "grn": 1226,
      "billNo": "KE/796",
      "supplierName": "KAKADIYA ENTERPRISE",
      "materialType": "Raw Material",
      "materialCategory": "Raw Material",
      "itemName": "ELASTIC MICRO NARROW WOVEN BUFF 84%NYLON 16%SPNDX 14MM\xA0 DEEP TAPUE",
      "receivedQuantity": 9e3,
      "checkedQuantity": 2700,
      "passQuantity": 9e3,
      "rejectedQuantity": 0,
      "itemRemarks": "PASS",
      "generalRemarks": "Pass",
      "zone": "KERALA",
      "location": "KERALA",
      "inspector": "SONY LENIN",
      "id": "fe1d4a7c-012f-4832-9b50-95abec4f5977"
    },
    {
      "timestamp": "2026-09-08T04:50:36.852Z",
      "receivedDate": "2026-08-31T18:30:00.000Z",
      "checkingDate": "2026-09-07T18:30:00.000Z",
      "date": "2026-09-07T18:30:00.000Z",
      "grn": 1223,
      "billNo": "KIPL2627INVO2601",
      "supplierName": "KONIKA INTIMA PRIVATE LIMITED",
      "materialType": "Raw Material",
      "materialCategory": "Raw Material",
      "itemName": "ELASTIC NARROW WOVEN ARROW 84%NYLON 16%SPANDEX 25MM WHITE",
      "receivedQuantity": 3230,
      "checkedQuantity": 969,
      "passQuantity": 3230,
      "rejectedQuantity": 0,
      "itemRemarks": "PASS",
      "generalRemarks": "PASS",
      "zone": "KERALA",
      "location": "KERALA",
      "inspector": "SONY LENIN",
      "id": "6475008a-1b16-4354-bc08-24f5d27e5e1f"
    },
    {
      "timestamp": "2026-09-08T04:46:31.091Z",
      "receivedDate": "2026-08-21T18:30:00.000Z",
      "checkingDate": "2026-09-07T18:30:00.000Z",
      "date": "2026-09-07T18:30:00.000Z",
      "grn": 1152,
      "billNo": "LBF260004321",
      "supplierName": "VARDHMAN TEXTILES LIMITED",
      "materialType": "Raw Material",
      "materialCategory": "Raw Material",
      "itemName": "CLOTH WOVEN 132 EPI-72PPI 100%CTN 40S 125GSM 58INCH DEEP TAUPE",
      "receivedQuantity": 1031,
      "checkedQuantity": 309,
      "passQuantity": 931,
      "rejectedQuantity": 100,
      "itemRemarks": "PASS",
      "generalRemarks": "520 MTR REJECTED DUE TO WET CONDITION",
      "zone": "KERALA",
      "location": "KERALA",
      "inspector": "SONY LENIN",
      "id": "b254681d-9aa6-42d9-a33a-aba0c0aa24a2"
    },
    {
      "timestamp": "2026-09-08T04:46:31.091Z",
      "receivedDate": "2026-08-21T18:30:00.000Z",
      "checkingDate": "2026-09-07T18:30:00.000Z",
      "date": "2026-09-07T18:30:00.000Z",
      "grn": 1152,
      "billNo": "LBF260004321",
      "supplierName": "VARDHMAN TEXTILES LIMITED",
      "materialType": "Raw Material",
      "materialCategory": "Raw Material",
      "itemName": "CLOTH WOVEN 132 EPI-72PPI 100%CTN 40S 125GSM 58INCH SEPLA ROSE",
      "receivedQuantity": 1535,
      "checkedQuantity": 460,
      "passQuantity": 1112,
      "rejectedQuantity": 420,
      "itemRemarks": "PASS",
      "generalRemarks": "520 MTR REJECTED DUE TO WET CONDITION",
      "zone": "KERALA",
      "location": "KERALA",
      "inspector": "SONY LENIN",
      "id": "59b782c3-4dea-424e-9a90-8a1658f03161"
    },
    {
      "timestamp": "2026-09-08T04:39:07.219Z",
      "receivedDate": "2026-08-21T18:30:00.000Z",
      "checkingDate": "2026-09-07T18:30:00.000Z",
      "date": "2026-09-07T18:30:00.000Z",
      "grn": 1153,
      "billNo": "LBF260004760",
      "supplierName": "VARDHMAN TEXTILES LIMITED",
      "materialType": "Raw Material",
      "materialCategory": "Raw Material",
      "itemName": "CLOTH WOVEN 132 EPI-72PPI 100%CTN 40S 125GSM 58INCH NUDE",
      "receivedQuantity": 4062,
      "checkedQuantity": 1218.6,
      "passQuantity": 3662,
      "rejectedQuantity": 400,
      "itemRemarks": "PASS",
      "generalRemarks": "615 MTR REJECTED DUE TO WET CONDITION",
      "zone": "KERALA",
      "location": "KERALA",
      "inspector": "SONY LENIN",
      "id": "48d622c4-b801-48d9-a4e3-bacd89f328d9"
    },
    {
      "timestamp": "2026-09-08T04:39:07.219Z",
      "receivedDate": "2026-08-21T18:30:00.000Z",
      "checkingDate": "2026-09-07T18:30:00.000Z",
      "date": "2026-09-07T18:30:00.000Z",
      "grn": 1153,
      "billNo": "LBF260004760",
      "supplierName": "VARDHMAN TEXTILES LIMITED",
      "materialType": "Raw Material",
      "materialCategory": "Raw Material",
      "itemName": "CLOTH WOVEN 132 EPI-72PPI 100%CTN 40S 125GSM 58INCH MAROON",
      "receivedQuantity": 2057,
      "checkedQuantity": 617,
      "passQuantity": 1842,
      "rejectedQuantity": 215,
      "itemRemarks": "PASS",
      "generalRemarks": "615 MTR REJECTED DUE TO WET CONDITION",
      "zone": "KERALA",
      "location": "KERALA",
      "inspector": "SONY LENIN",
      "id": "e4b5b30a-188d-4b24-a547-398fa0e5d796"
    },
    {
      "timestamp": "2026-09-04T09:40:15.558Z",
      "receivedDate": "2026-09-02T18:30:00.000Z",
      "checkingDate": "2026-09-03T18:30:00.000Z",
      "date": "2026-09-03T18:30:00.000Z",
      "grn": 1215,
      "billNo": "P426017955",
      "supplierName": "Vardhaman Yarns and Threads Limited",
      "materialType": "Raw Material",
      "materialCategory": "Raw Material",
      "itemName": "THREAD TRILOBAL PLSTR 27TX 2000MTRS NUDE",
      "receivedQuantity": 100,
      "checkedQuantity": 100,
      "passQuantity": 100,
      "rejectedQuantity": 0,
      "itemRemarks": "PASS",
      "generalRemarks": "PASS",
      "zone": "KERALA",
      "location": "KERALA",
      "inspector": "PRATHEEKSHA",
      "id": "9b91081a-609d-4440-a7ac-73d02c3a270e"
    },
    {
      "timestamp": "2026-09-04T09:40:15.558Z",
      "receivedDate": "2026-09-02T18:30:00.000Z",
      "checkingDate": "2026-09-03T18:30:00.000Z",
      "date": "2026-09-03T18:30:00.000Z",
      "grn": 1215,
      "billNo": "P426017955",
      "supplierName": "Vardhaman Yarns and Threads Limited",
      "materialType": "Raw Material",
      "materialCategory": "Raw Material",
      "itemName": "THREAD TRILOBAL PLSTR 27TX 2000MTRS\xA0 MAROON",
      "receivedQuantity": 30,
      "checkedQuantity": 30,
      "passQuantity": 30,
      "rejectedQuantity": 0,
      "itemRemarks": "PASS",
      "generalRemarks": "PASS",
      "zone": "KERALA",
      "location": "KERALA",
      "inspector": "PRATHEEKSHA",
      "id": "b747662d-69dd-439f-b987-060d6af42834"
    },
    {
      "timestamp": "2026-09-04T09:40:15.558Z",
      "receivedDate": "2026-09-02T18:30:00.000Z",
      "checkingDate": "2026-09-03T18:30:00.000Z",
      "date": "2026-09-03T18:30:00.000Z",
      "grn": 1215,
      "billNo": "P426017955",
      "supplierName": "Vardhaman Yarns and Threads Limited",
      "materialType": "Raw Material",
      "materialCategory": "Raw Material",
      "itemName": "THREAD TRILOBAL PLSTR 27TX 2000MTRS SEPLA ROSE",
      "receivedQuantity": 50,
      "checkedQuantity": 50,
      "passQuantity": 50,
      "rejectedQuantity": 0,
      "itemRemarks": "PASS",
      "generalRemarks": "PASS",
      "zone": "KERALA",
      "location": "KERALA",
      "inspector": "PRATHEEKSHA",
      "id": "1fda53a9-f284-4ae8-a6c1-f49bf7c7bb55"
    },
    {
      "timestamp": "2026-09-04T09:30:22.737Z",
      "receivedDate": "2026-09-02T18:30:00.000Z",
      "checkingDate": "2026-09-03T18:30:00.000Z",
      "date": "2026-09-03T18:30:00.000Z",
      "grn": 1219,
      "billNo": "RI/26-27 /29",
      "supplierName": "RICCIES INDUSTRIES",
      "materialType": "Raw Material",
      "materialCategory": "Raw Material",
      "itemName": "ADJUSTER METAL COATED 12MM NUDE",
      "receivedQuantity": 1e4,
      "checkedQuantity": 3e3,
      "passQuantity": 1e4,
      "rejectedQuantity": 0,
      "itemRemarks": "PASS",
      "generalRemarks": "PASS",
      "zone": "KERALA",
      "location": "KERALA",
      "inspector": "PRATHEEKSHA",
      "id": "0d7b3dee-59c6-489b-8d0f-fcc8c300317d"
    },
    {
      "timestamp": "2026-09-04T09:30:22.737Z",
      "receivedDate": "2026-09-02T18:30:00.000Z",
      "checkingDate": "2026-09-03T18:30:00.000Z",
      "date": "2026-09-03T18:30:00.000Z",
      "grn": 1219,
      "billNo": "RI/26-27 /29",
      "supplierName": "RICCIES INDUSTRIES",
      "materialType": "Raw Material",
      "materialCategory": "Raw Material",
      "itemName": "ADJUSTER METAL COATED 12MM MAROON",
      "receivedQuantity": 5e3,
      "checkedQuantity": 1500,
      "passQuantity": 5e3,
      "rejectedQuantity": 0,
      "itemRemarks": "PASS",
      "generalRemarks": "PASS",
      "zone": "KERALA",
      "location": "KERALA",
      "inspector": "PRATHEEKSHA",
      "id": "191ac008-f36e-47a2-8cf6-2e857cd99b93"
    },
    {
      "timestamp": "2026-09-04T09:30:22.737Z",
      "receivedDate": "2026-09-02T18:30:00.000Z",
      "checkingDate": "2026-09-03T18:30:00.000Z",
      "date": "2026-09-03T18:30:00.000Z",
      "grn": 1219,
      "billNo": "RI/26-27 /29",
      "supplierName": "RICCIES INDUSTRIES",
      "materialType": "Raw Material",
      "materialCategory": "Raw Material",
      "itemName": "ADJUSTER METAL COATED 18MM NUDE",
      "receivedQuantity": 15e3,
      "checkedQuantity": 4500,
      "passQuantity": 15e3,
      "rejectedQuantity": 0,
      "itemRemarks": "PASS",
      "generalRemarks": "PASS",
      "zone": "KERALA",
      "location": "KERALA",
      "inspector": "PRATHEEKSHA",
      "id": "25b05886-ea23-47f7-8a8d-c3b59b7f5dce"
    },
    {
      "timestamp": "2026-09-04T09:30:22.737Z",
      "receivedDate": "2026-09-02T18:30:00.000Z",
      "checkingDate": "2026-09-03T18:30:00.000Z",
      "date": "2026-09-03T18:30:00.000Z",
      "grn": 1219,
      "billNo": "RI/26-27 /29",
      "supplierName": "RICCIES INDUSTRIES",
      "materialType": "Raw Material",
      "materialCategory": "Raw Material",
      "itemName": "ADJUSTER METAL COATED 18MM WHITE",
      "receivedQuantity": 5e3,
      "checkedQuantity": 1500,
      "passQuantity": 5e3,
      "rejectedQuantity": 0,
      "itemRemarks": "PASS",
      "generalRemarks": "PASS",
      "zone": "KERALA",
      "location": "KERALA",
      "inspector": "PRATHEEKSHA",
      "id": "9254974c-e667-44b2-a976-9fe40cd79d4a"
    },
    {
      "timestamp": "2026-09-04T09:30:22.737Z",
      "receivedDate": "2026-09-02T18:30:00.000Z",
      "checkingDate": "2026-09-03T18:30:00.000Z",
      "date": "2026-09-03T18:30:00.000Z",
      "grn": 1219,
      "billNo": "RI/26-27 /29",
      "supplierName": "RICCIES INDUSTRIES",
      "materialType": "Raw Material",
      "materialCategory": "Raw Material",
      "itemName": "BOW SATIN NYLON 6MM NUDE",
      "receivedQuantity": 9500,
      "checkedQuantity": 2850,
      "passQuantity": 9500,
      "rejectedQuantity": 0,
      "itemRemarks": "PASS",
      "generalRemarks": "PASS",
      "zone": "KERALA",
      "location": "KERALA",
      "inspector": "PRATHEEKSHA",
      "id": "b9b27bc6-f2c2-4110-86c0-cba514189443"
    },
    {
      "timestamp": "2026-09-03T06:32:43.040Z",
      "receivedDate": "2026-08-21T18:30:00.000Z",
      "checkingDate": "2026-09-02T18:30:00.000Z",
      "date": "2026-09-02T18:30:00.000Z",
      "grn": 1154,
      "billNo": "LBF260004666",
      "supplierName": "VARDHMAN TEXTILES LIMITED",
      "materialType": "Raw Material",
      "materialCategory": "Raw Material",
      "itemName": "CLOTH WOVEN 132 EPI-72PPI 100%CTN 40S 125GSM 58INCH NUDE",
      "receivedQuantity": 4125,
      "checkedQuantity": 1237.5,
      "passQuantity": 3676,
      "rejectedQuantity": 449,
      "itemRemarks": "PASS",
      "generalRemarks": "449 MTR REJECTED DUE TO WET CONDITION . BALANCE QUANTITY PASS",
      "zone": "KERALA",
      "location": "KERALA",
      "inspector": "SONY LENIN",
      "id": "6fe3735b-ff57-4cfb-b631-86c293325dc3"
    },
    {
      "timestamp": "2026-09-03T06:32:43.040Z",
      "receivedDate": "2026-08-21T18:30:00.000Z",
      "checkingDate": "2026-09-02T18:30:00.000Z",
      "date": "2026-09-02T18:30:00.000Z",
      "grn": 1154,
      "billNo": "LBF260004666",
      "supplierName": "VARDHMAN TEXTILES LIMITED",
      "materialType": "Raw Material",
      "materialCategory": "Raw Material",
      "itemName": "CLOTH WOVEN 132 EPI-72PPI 100%CTN 40S 125GSM 58INCH MEDIEVAL BLUE",
      "receivedQuantity": 1029,
      "checkedQuantity": 308.7,
      "passQuantity": 1029,
      "rejectedQuantity": 0,
      "itemRemarks": "PASS",
      "generalRemarks": "449 MTR REJECTED DUE TO WET CONDITION . BALANCE QUANTITY PASS",
      "zone": "KERALA",
      "location": "KERALA",
      "inspector": "SONY LENIN",
      "id": "3c919042-5ebe-41c5-978d-d010b9d4ce11"
    },
    {
      "timestamp": "2026-09-03T06:23:45.047Z",
      "receivedDate": "2026-08-30T18:30:00.000Z",
      "checkingDate": "2026-09-02T18:30:00.000Z",
      "date": "2026-09-02T18:30:00.000Z",
      "grn": 1208,
      "billNo": "KE/757",
      "supplierName": "KAKADIYA ENTERPRISE",
      "materialType": "Raw Material",
      "materialCategory": "Raw Material",
      "itemName": "ELASTIC MICRO NARROW WOVEN BUFF 84%NYLON 16%SPNDX 14MM\xA0 QUIAL",
      "receivedQuantity": 13e3,
      "checkedQuantity": 3900,
      "passQuantity": 13e3,
      "rejectedQuantity": 0,
      "itemRemarks": "PASS",
      "generalRemarks": "PASS",
      "zone": "KERALA",
      "location": "KERALA",
      "inspector": "SONY LENIN",
      "id": "09a7abc8-bef7-4bf3-83b6-f076fed466d0"
    },
    {
      "timestamp": "2026-09-03T06:23:45.047Z",
      "receivedDate": "2026-08-30T18:30:00.000Z",
      "checkingDate": "2026-09-02T18:30:00.000Z",
      "date": "2026-09-02T18:30:00.000Z",
      "grn": 1208,
      "billNo": "KE/757",
      "supplierName": "KAKADIYA ENTERPRISE",
      "materialType": "Raw Material",
      "materialCategory": "Raw Material",
      "itemName": "ELASTIC MICRO NARROW WOVEN BUFF 84%NYLON 16%SPNDX 14MM\xA0 WHITE",
      "receivedQuantity": 4600,
      "checkedQuantity": 1380,
      "passQuantity": 4600,
      "rejectedQuantity": 0,
      "itemRemarks": "PASS",
      "generalRemarks": "PASS",
      "zone": "KERALA",
      "location": "KERALA",
      "inspector": "SONY LENIN",
      "id": "0ad5a079-109d-47d7-9a17-3388cdcc09fe"
    },
    {
      "timestamp": "2026-09-03T06:23:45.047Z",
      "receivedDate": "2026-08-30T18:30:00.000Z",
      "checkingDate": "2026-09-02T18:30:00.000Z",
      "date": "2026-09-02T18:30:00.000Z",
      "grn": 1208,
      "billNo": "KE/757",
      "supplierName": "KAKADIYA ENTERPRISE",
      "materialType": "Raw Material",
      "materialCategory": "Raw Material",
      "itemName": "ELASTIC MICRO NARROW WOVEN BUFF 84%NYLON 16%SPNDX 14MM\xA0NUDE",
      "receivedQuantity": 8850,
      "checkedQuantity": 2655,
      "passQuantity": 8850,
      "rejectedQuantity": 0,
      "itemRemarks": "PASS",
      "generalRemarks": "PASS",
      "zone": "KERALA",
      "location": "KERALA",
      "inspector": "SONY LENIN",
      "id": "f0556780-4534-4d72-8892-b7453b17a249"
    },
    {
      "timestamp": "2026-09-02T10:24:50.564Z",
      "receivedDate": "2026-08-31T18:30:00.000Z",
      "checkingDate": "2026-09-01T18:30:00.000Z",
      "date": "2026-09-01T18:30:00.000Z",
      "grn": "I/R",
      "billNo": "G-0117 /26-27",
      "supplierName": "BASKAR EMBROIDERY - TIRUPUR",
      "materialType": "Raw Material",
      "materialCategory": "Raw Material",
      "itemName": "HOOK-EYE 2x3 MICRO FIBER NYLON-SS 32-60MM NON BRUSHED-RELUX WHITE",
      "receivedQuantity": 11600,
      "checkedQuantity": 3480,
      "passQuantity": 11600,
      "rejectedQuantity": 0,
      "itemRemarks": "PASS",
      "generalRemarks": "PASS",
      "zone": "KERALA",
      "location": "KERALA",
      "inspector": "PRATHEEKSHA",
      "id": "6d2712c7-844a-401d-be3a-554f700e3ce6"
    },
    {
      "timestamp": "2026-09-02T10:24:50.564Z",
      "receivedDate": "2026-08-31T18:30:00.000Z",
      "checkingDate": "2026-09-01T18:30:00.000Z",
      "date": "2026-09-01T18:30:00.000Z",
      "grn": "I/R",
      "billNo": "G-0117 /26-27",
      "supplierName": "BASKAR EMBROIDERY - TIRUPUR",
      "materialType": "Raw Material",
      "materialCategory": "Raw Material",
      "itemName": "HOOK-EYE 2x3 MICRO FIBER NYLON-SS 32-60MM NON BRUSHED-RELUX BURL WOOD",
      "receivedQuantity": 4600,
      "checkedQuantity": 1380,
      "passQuantity": 4600,
      "rejectedQuantity": 0,
      "itemRemarks": "PASS",
      "generalRemarks": "PASS",
      "zone": "KERALA",
      "location": "KERALA",
      "inspector": "PRATHEEKSHA",
      "id": "d220a015-3993-40b2-ab25-049cd15d37f8"
    },
    {
      "timestamp": "2026-09-02T10:24:50.564Z",
      "receivedDate": "2026-08-31T18:30:00.000Z",
      "checkingDate": "2026-09-01T18:30:00.000Z",
      "date": "2026-09-01T18:30:00.000Z",
      "grn": "I/R",
      "billNo": "G-0117 /26-27",
      "supplierName": "BASKAR EMBROIDERY - TIRUPUR",
      "materialType": "Raw Material",
      "materialCategory": "Raw Material",
      "itemName": "HOOK-EYE 2x3 MICRO FIBER NYLON-SS 32-60MM NON BRUSHED-RELUX CORONET BLUE",
      "receivedQuantity": 4610,
      "checkedQuantity": 1383,
      "passQuantity": 4610,
      "rejectedQuantity": 0,
      "itemRemarks": "PASS",
      "generalRemarks": "PASS",
      "zone": "KERALA",
      "location": "KERALA",
      "inspector": "PRATHEEKSHA",
      "id": "9a121c94-c564-48c6-82f3-8417ddd3636b"
    },
    {
      "timestamp": "2026-09-02T10:24:50.564Z",
      "receivedDate": "2026-08-31T18:30:00.000Z",
      "checkingDate": "2026-09-01T18:30:00.000Z",
      "date": "2026-09-01T18:30:00.000Z",
      "grn": "I/R",
      "billNo": "G-0117 /26-27",
      "supplierName": "BASKAR EMBROIDERY - TIRUPUR",
      "materialType": "Raw Material",
      "materialCategory": "Raw Material",
      "itemName": "HOOK-EYE 2x3 MICRO FIBER NYLON-SS 32-60MM NON BRUSHED-RELUX SEPLA ROSE",
      "receivedQuantity": 4640,
      "checkedQuantity": 1392,
      "passQuantity": 4640,
      "rejectedQuantity": 0,
      "itemRemarks": "PASS",
      "generalRemarks": "PASS",
      "zone": "KERALA",
      "location": "KERALA",
      "inspector": "PRATHEEKSHA",
      "id": "72d2ad48-64d3-41b6-a19c-6fc8d83cc48d"
    },
    {
      "timestamp": "2026-09-02T10:24:50.564Z",
      "receivedDate": "2026-08-31T18:30:00.000Z",
      "checkingDate": "2026-09-01T18:30:00.000Z",
      "date": "2026-09-01T18:30:00.000Z",
      "grn": "I/R",
      "billNo": "G-0117 /26-27",
      "supplierName": "BASKAR EMBROIDERY - TIRUPUR",
      "materialType": "Raw Material",
      "materialCategory": "Raw Material",
      "itemName": "HOOK-EYE 2x3 MICRO FIBER NYLON-SS 32-60MM NON BRUSHED-RELUX DEEP TAUPE",
      "receivedQuantity": 4610,
      "checkedQuantity": 1383,
      "passQuantity": 4610,
      "rejectedQuantity": 0,
      "itemRemarks": "PASS",
      "generalRemarks": "PASS",
      "zone": "KERALA",
      "location": "KERALA",
      "inspector": "PRATHEEKSHA",
      "id": "82a8f877-7788-4d92-bd45-7a0055e49e63"
    },
    {
      "timestamp": "2026-09-02T10:13:40.749Z",
      "receivedDate": "2026-08-30T18:30:00.000Z",
      "checkingDate": "2026-09-01T18:30:00.000Z",
      "date": "2026-09-01T18:30:00.000Z",
      "grn": 1203,
      "billNo": "ML- 2608659",
      "supplierName": "M LACHHMANDAS & CO",
      "materialType": "Raw Material",
      "materialCategory": "Raw Material",
      "itemName": "CLOTH WOVEN VAKRUM 1 100%CTN 25MM WHITE",
      "receivedQuantity": 5e3,
      "checkedQuantity": 1500,
      "passQuantity": 5e3,
      "rejectedQuantity": 0,
      "itemRemarks": "PASS",
      "generalRemarks": "PASS",
      "zone": "KERALA",
      "location": "KERALA",
      "inspector": "PRATHEEKSHA",
      "id": "2e68e62c-8077-48d0-8d02-7b9178124e5d"
    },
    {
      "timestamp": "2026-09-01T08:30:20.515Z",
      "receivedDate": "2026-08-30T18:30:00.000Z",
      "checkingDate": "2026-08-31T18:30:00.000Z",
      "date": "2026-08-31T18:30:00.000Z",
      "grn": 1207,
      "billNo": "P426017534",
      "supplierName": "Vardhaman Yarns and Threads Limited",
      "materialType": "Raw Material",
      "materialCategory": "Raw Material",
      "itemName": "THREAD TRILOBAL PLSTR 27TX 2000MTRS WHITE",
      "receivedQuantity": 50,
      "checkedQuantity": 50,
      "passQuantity": 50,
      "rejectedQuantity": 0,
      "itemRemarks": "PASS",
      "generalRemarks": "PASS",
      "zone": "KERALA",
      "location": "KERALA",
      "inspector": "PRATHEEKSHA",
      "id": "e16b6613-fe1f-47f5-8dcd-386d004438f6"
    },
    {
      "timestamp": "2026-09-01T07:15:01.939Z",
      "receivedDate": "2026-08-27T18:30:00.000Z",
      "checkingDate": "2026-08-31T18:30:00.000Z",
      "date": "2026-08-31T18:30:00.000Z",
      "grn": 1189,
      "billNo": "JNF-308/2026-27",
      "supplierName": "JAIN NARROW FABS",
      "materialType": "Raw Material",
      "materialCategory": "Raw Material",
      "itemName": "TAPE PLSTR JULIE LACE 10MM WHITE",
      "receivedQuantity": 900,
      "checkedQuantity": 270,
      "passQuantity": 900,
      "rejectedQuantity": 0,
      "itemRemarks": "PASS",
      "generalRemarks": "PASS",
      "zone": "KERALA",
      "location": "KERALA",
      "inspector": "PRATHEEKSHA",
      "id": "3bfc9690-df83-454b-90b1-fffc7d4a99cf"
    },
    {
      "timestamp": "2026-09-01T07:12:57.867Z",
      "receivedDate": "2026-09-27T18:30:00.000Z",
      "checkingDate": "2026-08-31T18:30:00.000Z",
      "date": "2026-08-31T18:30:00.000Z",
      "grn": 1189,
      "billNo": "JNF-308/2026-27",
      "supplierName": "JAIN NARROW FABS",
      "materialType": "Raw Material",
      "materialCategory": "Raw Material",
      "itemName": "TAPE PLSTR JULIE LACE 10MM NUDE",
      "receivedQuantity": 13800,
      "checkedQuantity": 4140,
      "passQuantity": 13800,
      "rejectedQuantity": 0,
      "itemRemarks": "PASS",
      "generalRemarks": "PASS",
      "zone": "KERALA",
      "location": "KERALA",
      "inspector": "PRATHEEKSHA",
      "id": "8f841149-20d1-4b71-a2bb-74d666461a88"
    },
    {
      "timestamp": "2026-09-01T04:32:54.323Z",
      "receivedDate": "2026-08-30T18:30:00.000Z",
      "checkingDate": "2026-08-31T18:30:00.000Z",
      "date": "2026-08-31T18:30:00.000Z",
      "grn": 1198,
      "billNo": 298,
      "supplierName": "ASSOCIATED CLOTHINGS",
      "materialType": "Raw Material",
      "materialCategory": "Raw Material",
      "itemName": "ACC STRAP 100% CTN 14MM NUDE",
      "receivedQuantity": 2016,
      "checkedQuantity": 604,
      "passQuantity": 2016,
      "rejectedQuantity": 0,
      "itemRemarks": "PASS",
      "generalRemarks": "PASS",
      "zone": "KERALA",
      "location": "KERALA",
      "inspector": "PRATHEEKSHA",
      "id": "05945f76-45e3-4128-bcda-287fc1b54e8d"
    },
    {
      "timestamp": "2026-08-31T09:35:33.272Z",
      "receivedDate": "2026-08-27T18:30:00.000Z",
      "checkingDate": "2026-08-30T18:30:00.000Z",
      "date": "2026-08-30T18:30:00.000Z",
      "grn": 1182,
      "billNo": 9848,
      "supplierName": "SIVAM TRADERS",
      "materialType": "Raw Material",
      "materialCategory": "Raw Material",
      "itemName": "THREAD 3PLY PLSTR 24TX 5000MTRS MAROON",
      "receivedQuantity": 100,
      "checkedQuantity": 30,
      "passQuantity": 100,
      "rejectedQuantity": 0,
      "itemRemarks": "PASS",
      "generalRemarks": "PASS",
      "zone": "KERALA",
      "location": "KERALA",
      "inspector": "SONY LENIN",
      "id": "0db52d1f-11e7-4bd6-9331-0d3fce3c0a12"
    },
    {
      "timestamp": "2026-08-31T09:35:33.272Z",
      "receivedDate": "2026-08-27T18:30:00.000Z",
      "checkingDate": "2026-08-30T18:30:00.000Z",
      "date": "2026-08-30T18:30:00.000Z",
      "grn": 1182,
      "billNo": 9848,
      "supplierName": "SIVAM TRADERS",
      "materialType": "Raw Material",
      "materialCategory": "Raw Material",
      "itemName": "THREAD 3PLY PLSTR 24TX 5000MTRS MEDIEVAL BLUE",
      "receivedQuantity": 100,
      "checkedQuantity": 30,
      "passQuantity": 100,
      "rejectedQuantity": 0,
      "itemRemarks": "PASS",
      "generalRemarks": "PASS",
      "zone": "KERALA",
      "location": "KERALA",
      "inspector": "SONY LENIN",
      "id": "c65c76f0-4dad-4377-a23e-9a4ae4050cfd"
    },
    {
      "timestamp": "2026-08-31T09:35:33.272Z",
      "receivedDate": "2026-08-27T18:30:00.000Z",
      "checkingDate": "2026-08-30T18:30:00.000Z",
      "date": "2026-08-30T18:30:00.000Z",
      "grn": 1182,
      "billNo": 9848,
      "supplierName": "SIVAM TRADERS",
      "materialType": "Raw Material",
      "materialCategory": "Raw Material",
      "itemName": "THREAD 3PLY PLSTR 24TX 5000MTRS WHITE",
      "receivedQuantity": 200,
      "checkedQuantity": 60,
      "passQuantity": 200,
      "rejectedQuantity": 0,
      "itemRemarks": "PASS",
      "generalRemarks": "PASS",
      "zone": "KERALA",
      "location": "KERALA",
      "inspector": "SONY LENIN",
      "id": "1994aa4f-c666-4f63-812c-94e966aaea9d"
    },
    {
      "timestamp": "2026-08-31T09:35:33.272Z",
      "receivedDate": "2026-08-27T18:30:00.000Z",
      "checkingDate": "2026-08-30T18:30:00.000Z",
      "date": "2026-08-30T18:30:00.000Z",
      "grn": 1182,
      "billNo": 9848,
      "supplierName": "SIVAM TRADERS",
      "materialType": "Raw Material",
      "materialCategory": "Raw Material",
      "itemName": "THREAD 3PLY PLSTR 24TX 5000MTRS BURL WOOD",
      "receivedQuantity": 100,
      "checkedQuantity": 30,
      "passQuantity": 100,
      "rejectedQuantity": 0,
      "itemRemarks": "PASS",
      "generalRemarks": "PASS",
      "zone": "KERALA",
      "location": "KERALA",
      "inspector": "SONY LENIN",
      "id": "020781d4-7a62-4c0b-b37b-eaec6fd4b39e"
    },
    {
      "timestamp": "2026-08-31T09:35:33.272Z",
      "receivedDate": "2026-08-27T18:30:00.000Z",
      "checkingDate": "2026-08-30T18:30:00.000Z",
      "date": "2026-08-30T18:30:00.000Z",
      "grn": 1182,
      "billNo": 9848,
      "supplierName": "SIVAM TRADERS",
      "materialType": "Raw Material",
      "materialCategory": "Raw Material",
      "itemName": "THREAD 3PLY PLSTR 24TX 5000MTRS DEEP TAUPE",
      "receivedQuantity": 100,
      "checkedQuantity": 30,
      "passQuantity": 100,
      "rejectedQuantity": 0,
      "itemRemarks": "PASS",
      "generalRemarks": "PASS",
      "zone": "KERALA",
      "location": "KERALA",
      "inspector": "SONY LENIN",
      "id": "ce371584-35ee-40a2-b990-a5cae959234d"
    },
    {
      "timestamp": "2026-08-31T09:35:33.272Z",
      "receivedDate": "2026-08-27T18:30:00.000Z",
      "checkingDate": "2026-08-30T18:30:00.000Z",
      "date": "2026-08-30T18:30:00.000Z",
      "grn": 1182,
      "billNo": 9848,
      "supplierName": "SIVAM TRADERS",
      "materialType": "Raw Material",
      "materialCategory": "Raw Material",
      "itemName": "THREAD 3PLY PLSTR 24TX 5000MTRS QUIAL",
      "receivedQuantity": 100,
      "checkedQuantity": 30,
      "passQuantity": 100,
      "rejectedQuantity": 0,
      "itemRemarks": "PASS",
      "generalRemarks": "PASS",
      "zone": "KERALA",
      "location": "KERALA",
      "inspector": "SONY LENIN",
      "id": "9f78ba46-5a13-47c8-8bdb-2d77b8181bd4"
    },
    {
      "timestamp": "2026-08-31T09:35:33.272Z",
      "receivedDate": "2026-08-27T18:30:00.000Z",
      "checkingDate": "2026-08-30T18:30:00.000Z",
      "date": "2026-08-30T18:30:00.000Z",
      "grn": 1182,
      "billNo": 9848,
      "supplierName": "SIVAM TRADERS",
      "materialType": "Raw Material",
      "materialCategory": "Raw Material",
      "itemName": "THREAD 3PLY PLSTR 24TX 5000MTRS SEPLA ROSE",
      "receivedQuantity": 100,
      "checkedQuantity": 30,
      "passQuantity": 100,
      "rejectedQuantity": 0,
      "itemRemarks": "PASS",
      "generalRemarks": "PASS",
      "zone": "KERALA",
      "location": "KERALA",
      "inspector": "SONY LENIN",
      "id": "cdfdeafc-e131-4897-a65a-45ee9c5e2d9c"
    },
    {
      "timestamp": "2026-08-31T09:35:33.272Z",
      "receivedDate": "2026-08-27T18:30:00.000Z",
      "checkingDate": "2026-08-30T18:30:00.000Z",
      "date": "2026-08-30T18:30:00.000Z",
      "grn": 1182,
      "billNo": 9848,
      "supplierName": "SIVAM TRADERS",
      "materialType": "Raw Material",
      "materialCategory": "Raw Material",
      "itemName": "THREAD 3PLY PLSTR 24TX 5000MTRS SLATE",
      "receivedQuantity": 100,
      "checkedQuantity": 30,
      "passQuantity": 100,
      "rejectedQuantity": 0,
      "itemRemarks": "PASS",
      "generalRemarks": "PASS",
      "zone": "KERALA",
      "location": "KERALA",
      "inspector": "SONY LENIN",
      "id": "d587df70-1390-4524-9ca3-d3db5c3755d1"
    },
    {
      "timestamp": "2026-08-31T07:09:58.181Z",
      "receivedDate": "2026-08-27T18:30:00.000Z",
      "checkingDate": "2026-08-30T18:30:00.000Z",
      "date": "2026-08-30T18:30:00.000Z",
      "grn": 1181,
      "billNo": 10048,
      "supplierName": "SIVAM TRADERS",
      "materialType": "Raw Material",
      "materialCategory": "Raw Material",
      "itemName": "THREAD 3PLY PLSTR 24TX 5000MTRS NUDE",
      "receivedQuantity": 300,
      "checkedQuantity": 90,
      "passQuantity": 300,
      "rejectedQuantity": 0,
      "itemRemarks": "PASS",
      "generalRemarks": "PASS",
      "zone": "KERALA",
      "location": "KERALA",
      "inspector": "SONY LENIN",
      "id": "1a4b77fd-048b-4267-88da-fd4b0d595c65"
    },
    {
      "timestamp": "2026-08-31T05:43:17.067Z",
      "receivedDate": "2026-08-17T18:30:00.000Z",
      "checkingDate": "2026-08-30T18:30:00.000Z",
      "date": "2026-08-30T18:30:00.000Z",
      "grn": 1156,
      "billNo": "AC/26-27/277",
      "supplierName": "ASSOCIATED CLOTHINGS",
      "materialType": "Raw Material",
      "materialCategory": "Raw Material",
      "itemName": "ACC STRAP 100% CTN 14MM WHITE",
      "receivedQuantity": 672,
      "checkedQuantity": 672,
      "passQuantity": 552,
      "rejectedQuantity": 120,
      "itemRemarks": "PASS",
      "generalRemarks": "PASS",
      "zone": "KERALA",
      "location": "KERALA",
      "inspector": "PRATHEEKSHA",
      "id": "bbb5c3e2-758b-4407-9a89-f91db4a62e0a"
    },
    {
      "timestamp": "2026-08-29T09:51:44.497Z",
      "receivedDate": "2026-08-27T18:30:00.000Z",
      "checkingDate": "2026-08-28T18:30:00.000Z",
      "date": "2026-08-28T18:30:00.000Z",
      "grn": "I/R",
      "billNo": "G-0115 /26-27",
      "supplierName": "BASKAR EMBROIDERY - TIRUPUR",
      "materialType": "Raw Material",
      "materialCategory": "Raw Material",
      "itemName": "HOOK-EYE 2x3 MICRO FIBER NYLON-SS 32-60MM NON BRUSHED-RELUX MEDIEVAL BLUE",
      "receivedQuantity": 6900,
      "checkedQuantity": 2070,
      "passQuantity": 6900,
      "rejectedQuantity": 0,
      "itemRemarks": "PASS",
      "generalRemarks": "PASS",
      "zone": "KERALA",
      "location": "KERALA",
      "inspector": "PRATHEEKSHA",
      "id": "75b4de54-b9c3-4765-b154-d7aede21ec1c"
    },
    {
      "timestamp": "2026-08-29T09:51:44.497Z",
      "receivedDate": "2026-08-27T18:30:00.000Z",
      "checkingDate": "2026-08-28T18:30:00.000Z",
      "date": "2026-08-28T18:30:00.000Z",
      "grn": "I/R",
      "billNo": "G-0115 /26-27",
      "supplierName": "BASKAR EMBROIDERY - TIRUPUR",
      "materialType": "Raw Material",
      "materialCategory": "Raw Material",
      "itemName": "HOOK-EYE 2x3 MICRO FIBER NYLON-SS 32-60MM NON BRUSHED-RELUX MAROON",
      "receivedQuantity": 4570,
      "checkedQuantity": 1371,
      "passQuantity": 4570,
      "rejectedQuantity": 0,
      "itemRemarks": "PASS",
      "generalRemarks": "PASS",
      "zone": "KERALA",
      "location": "KERALA",
      "inspector": "PRATHEEKSHA",
      "id": "a06fd5c8-a9f6-4ee7-ac26-0b6bd3a97efb"
    },
    {
      "timestamp": "2026-08-29T09:51:44.497Z",
      "receivedDate": "2026-08-27T18:30:00.000Z",
      "checkingDate": "2026-08-28T18:30:00.000Z",
      "date": "2026-08-28T18:30:00.000Z",
      "grn": "I/R",
      "billNo": "G-0115 /26-27",
      "supplierName": "BASKAR EMBROIDERY - TIRUPUR",
      "materialType": "Raw Material",
      "materialCategory": "Raw Material",
      "itemName": "HOOK-EYE 3*3 MICRO FIBER NYLON-SS 44-55MM NON BRUSHED-RELUX MAROON",
      "receivedQuantity": 3390,
      "checkedQuantity": 1017,
      "passQuantity": 3390,
      "rejectedQuantity": 0,
      "itemRemarks": "PASS",
      "generalRemarks": "PASS",
      "zone": "KERALA",
      "location": "KERALA",
      "inspector": "PRATHEEKSHA",
      "id": "7d2348c2-e61e-4e49-94ec-e8c00b4b496a"
    },
    {
      "timestamp": "2026-08-29T09:35:26.651Z",
      "receivedDate": "2026-08-27T18:30:00.000Z",
      "checkingDate": "2026-08-28T18:30:00.000Z",
      "date": "2026-08-28T18:30:00.000Z",
      "grn": 1186,
      "billNo": 1495,
      "supplierName": "SACHINAM FABRICS PVT LTD",
      "materialType": "Raw Material",
      "materialCategory": "Raw Material",
      "itemName": "ELASTIC NARROW WOVEN 77%NYLON 23%SPNDX 17MM SN86-17 NUDE",
      "receivedQuantity": 3e3,
      "checkedQuantity": 900,
      "passQuantity": 3e3,
      "rejectedQuantity": 0,
      "itemRemarks": "PASS",
      "generalRemarks": "PASS",
      "zone": "KERALA",
      "location": "KERALA",
      "inspector": "PRATHEEKSHA",
      "id": "d94a5f34-af80-47c5-9f07-b155008dd2a2"
    },
    {
      "timestamp": "2026-08-29T09:35:26.651Z",
      "receivedDate": "2026-08-27T18:30:00.000Z",
      "checkingDate": "2026-08-28T18:30:00.000Z",
      "date": "2026-08-28T18:30:00.000Z",
      "grn": 1186,
      "billNo": 1495,
      "supplierName": "SACHINAM FABRICS PVT LTD",
      "materialType": "Raw Material",
      "materialCategory": "Raw Material",
      "itemName": "ELASTIC MICRO NARROW WOVEN BUFF 84%NYLON 16%SPNDX 14MM\xA0SEPLA ROSE",
      "receivedQuantity": 1e4,
      "checkedQuantity": 3e3,
      "passQuantity": 1e4,
      "rejectedQuantity": 0,
      "itemRemarks": "PASS",
      "generalRemarks": "PASS",
      "zone": "KERALA",
      "location": "KERALA",
      "inspector": "PRATHEEKSHA",
      "id": "9b902a45-6863-4def-be84-eccfef90d09c"
    },
    {
      "timestamp": "2026-08-28T05:33:32.212Z",
      "receivedDate": "2026-08-20T18:30:00.000Z",
      "checkingDate": "2026-08-21T18:30:00.000Z",
      "date": "2026-08-21T18:30:00.000Z",
      "grn": 1134,
      "billNo": 1477,
      "supplierName": "SACHINAM FABRICS PVT LTD",
      "materialType": "Raw Material",
      "materialCategory": "Raw Material",
      "itemName": "ELASTIC MICRO NARROW WOVEN BUFF 84%NYLON 16%SPNDX 14MM\xA0CORONET BLUE",
      "receivedQuantity": 9970,
      "checkedQuantity": 2991,
      "passQuantity": 9970,
      "rejectedQuantity": 0,
      "itemRemarks": "PASS",
      "generalRemarks": "PASS",
      "zone": "KERALA",
      "location": "KERALA",
      "inspector": "PRATHEEKSHA",
      "id": "7e3a1519-7d18-47a5-b0e6-46c6dbafbdfc"
    },
    {
      "timestamp": "2026-08-28T05:33:32.212Z",
      "receivedDate": "2026-08-20T18:30:00.000Z",
      "checkingDate": "2026-08-21T18:30:00.000Z",
      "date": "2026-08-21T18:30:00.000Z",
      "grn": 1134,
      "billNo": 1477,
      "supplierName": "SACHINAM FABRICS PVT LTD",
      "materialType": "Raw Material",
      "materialCategory": "Raw Material",
      "itemName": "ELASTIC MICRO NARROW WOVEN BUFF 84%NYLON 16%SPNDX 14MM\xA0SLATE",
      "receivedQuantity": 10120,
      "checkedQuantity": 3036,
      "passQuantity": 10120,
      "rejectedQuantity": 0,
      "itemRemarks": "PASS",
      "generalRemarks": "PASS",
      "zone": "KERALA",
      "location": "KERALA",
      "inspector": "PRATHEEKSHA",
      "id": "66c565e6-94f9-41c8-9ad3-308d9cc3de1c"
    },
    {
      "timestamp": "2026-08-28T05:33:32.212Z",
      "receivedDate": "2026-08-20T18:30:00.000Z",
      "checkingDate": "2026-08-21T18:30:00.000Z",
      "date": "2026-08-21T18:30:00.000Z",
      "grn": 1134,
      "billNo": 1477,
      "supplierName": "SACHINAM FABRICS PVT LTD",
      "materialType": "Raw Material",
      "materialCategory": "Raw Material",
      "itemName": "ELASTIC MICRO NARROW WOVEN BUFF 84%NYLON 16%SPNDX 18MM\xA0CORONET BLUE",
      "receivedQuantity": 3400,
      "checkedQuantity": 1020,
      "passQuantity": 3400,
      "rejectedQuantity": 0,
      "itemRemarks": "PASS",
      "generalRemarks": "PASS",
      "zone": "KERALA",
      "location": "KERALA",
      "inspector": "PRATHEEKSHA",
      "id": "e0ea8717-19a4-4ab2-adea-b1df1a7634fd"
    },
    {
      "timestamp": "2026-08-28T05:33:32.212Z",
      "receivedDate": "2026-08-20T18:30:00.000Z",
      "checkingDate": "2026-08-21T18:30:00.000Z",
      "date": "2026-08-21T18:30:00.000Z",
      "grn": 1134,
      "billNo": 1477,
      "supplierName": "SACHINAM FABRICS PVT LTD",
      "materialType": "Raw Material",
      "materialCategory": "Raw Material",
      "itemName": "ELASTIC MICRO NARROW WOVEN BUFF 84%NYLON 16%SPNDX 18MM\xA0SLATE",
      "receivedQuantity": 5300,
      "checkedQuantity": 1590,
      "passQuantity": 5300,
      "rejectedQuantity": 0,
      "itemRemarks": "PASS",
      "generalRemarks": "PASS",
      "zone": "KERALA",
      "location": "KERALA",
      "inspector": "PRATHEEKSHA",
      "id": "9e1e0797-799f-46c1-a2e6-14fbd42e570c"
    },
    {
      "timestamp": "2026-08-28T05:18:17.838Z",
      "receivedDate": "2026-08-17T18:30:00.000Z",
      "checkingDate": "2026-08-27T18:30:00.000Z",
      "date": "2026-08-27T18:30:00.000Z",
      "grn": 1156,
      "billNo": "AC/26-27 /277",
      "supplierName": "ASSOCIATED CLOTHINGS",
      "materialType": "Raw Material",
      "materialCategory": "Raw Material",
      "itemName": "ACC STRAP 100% CTN 14MM WHITE",
      "receivedQuantity": 672,
      "checkedQuantity": 672,
      "passQuantity": 552,
      "rejectedQuantity": 120,
      "itemRemarks": "PASS",
      "generalRemarks": "PASS",
      "zone": "KERALA",
      "location": "KERALA",
      "inspector": "PRATHEEKSHA",
      "id": "28a73c2e-36b4-43ca-a7ac-0d61b54a0c32"
    },
    {
      "timestamp": "2026-08-22T12:04:22.967Z",
      "receivedDate": "2026-08-20T18:30:00.000Z",
      "checkingDate": "2026-08-21T18:30:00.000Z",
      "date": "2026-08-21T18:30:00.000Z",
      "grn": 1135,
      "billNo": "KIIPL2627INVO2304",
      "supplierName": "KONIKA INTIMA PRIVATE LIMITED",
      "materialType": "Raw Material",
      "materialCategory": "Raw Material",
      "itemName": "ELASTIC NARROW WOVEN 84%NYLON 16%SPANDEX 25MM MAROON",
      "receivedQuantity": 1e3,
      "checkedQuantity": 300,
      "passQuantity": 1e3,
      "rejectedQuantity": 0,
      "itemRemarks": "PASS",
      "generalRemarks": "PASS",
      "zone": "KERALA",
      "location": "KERALA",
      "inspector": "PRATHEEKSHA",
      "id": "fc36f1df-e148-47de-9202-e0afac4e55b5"
    },
    {
      "timestamp": "2026-08-22T12:03:11.712Z",
      "receivedDate": "2026-08-20T18:30:00.000Z",
      "checkingDate": "2026-08-21T18:30:00.000Z",
      "date": "2026-08-21T18:30:00.000Z",
      "grn": 1099,
      "billNo": "GST-1795",
      "supplierName": "AISWARYA POLYFLEX PVT LTD",
      "materialType": "Raw Material",
      "materialCategory": "Raw Material",
      "itemName": "STICKER SMALL BLOSSOM PRINTED 60*35 MM",
      "receivedQuantity": 306e3,
      "checkedQuantity": 1e4,
      "passQuantity": 306e3,
      "rejectedQuantity": 0,
      "itemRemarks": "PASS",
      "generalRemarks": "PASS",
      "zone": "KERALA",
      "location": "KERALA",
      "inspector": "PRATHEEKSHA",
      "id": "5206025e-399d-468e-8ffc-0fba63eb599f"
    },
    {
      "timestamp": "2026-08-22T04:40:47.500Z",
      "receivedDate": "2026-08-20T18:30:00.000Z",
      "checkingDate": "2026-08-21T18:30:00.000Z",
      "date": "2026-08-21T18:30:00.000Z",
      "grn": 1103,
      "billNo": "E126007738",
      "supplierName": "Vardhaman Yarns and Threads Limited",
      "materialType": "Raw Material",
      "materialCategory": "Raw Material",
      "itemName": "THREAD CTN 20S 1000 BURL WOOD",
      "receivedQuantity": 30,
      "checkedQuantity": 30,
      "passQuantity": 30,
      "rejectedQuantity": 0,
      "itemRemarks": "PASS",
      "generalRemarks": "PASS",
      "zone": "KERALA",
      "location": "KERALA",
      "inspector": "PRATHEEKSHA",
      "id": "c85ef26a-accc-4ea6-9db4-23f1db5fd3e6"
    },
    {
      "timestamp": "2026-08-22T04:40:47.500Z",
      "receivedDate": "2026-08-20T18:30:00.000Z",
      "checkingDate": "2026-08-21T18:30:00.000Z",
      "date": "2026-08-21T18:30:00.000Z",
      "grn": 1103,
      "billNo": "E126007738",
      "supplierName": "Vardhaman Yarns and Threads Limited",
      "materialType": "Raw Material",
      "materialCategory": "Raw Material",
      "itemName": "THREAD CTN 20S 1000 DEEP TAUPE",
      "receivedQuantity": 30,
      "checkedQuantity": 30,
      "passQuantity": 30,
      "rejectedQuantity": 0,
      "itemRemarks": "PASS",
      "generalRemarks": "PASS",
      "zone": "KERALA",
      "location": "KERALA",
      "inspector": "PRATHEEKSHA",
      "id": "aebed99d-5e6d-4ee4-81c7-487dc1a27943"
    },
    {
      "timestamp": "2026-08-22T04:40:47.500Z",
      "receivedDate": "2026-08-20T18:30:00.000Z",
      "checkingDate": "2026-08-21T18:30:00.000Z",
      "date": "2026-08-21T18:30:00.000Z",
      "grn": 1103,
      "billNo": "E126007738",
      "supplierName": "Vardhaman Yarns and Threads Limited",
      "materialType": "Raw Material",
      "materialCategory": "Raw Material",
      "itemName": "THREAD CTN 20S 1000 QUIAL",
      "receivedQuantity": 30,
      "checkedQuantity": 30,
      "passQuantity": 30,
      "rejectedQuantity": 0,
      "itemRemarks": "PASS",
      "generalRemarks": "PASS",
      "zone": "KERALA",
      "location": "KERALA",
      "inspector": "PRATHEEKSHA",
      "id": "4d3841f2-8d8b-4120-9f5d-f3a3f974e1f2"
    },
    {
      "timestamp": "2026-08-22T04:40:47.500Z",
      "receivedDate": "2026-08-20T18:30:00.000Z",
      "checkingDate": "2026-08-21T18:30:00.000Z",
      "date": "2026-08-21T18:30:00.000Z",
      "grn": 1103,
      "billNo": "E126007738",
      "supplierName": "Vardhaman Yarns and Threads Limited",
      "materialType": "Raw Material",
      "materialCategory": "Raw Material",
      "itemName": "THREAD CTN 20S 1000 CORONET BLUE",
      "receivedQuantity": 30,
      "checkedQuantity": 30,
      "passQuantity": 30,
      "rejectedQuantity": 0,
      "itemRemarks": "PASS",
      "generalRemarks": "PASS",
      "zone": "KERALA",
      "location": "KERALA",
      "inspector": "PRATHEEKSHA",
      "id": "50fada5b-3566-4a98-8cfd-508ed083176f"
    },
    {
      "timestamp": "2026-08-22T04:32:11.284Z",
      "receivedDate": "2026-08-20T18:30:00.000Z",
      "checkingDate": "2026-08-21T18:30:00.000Z",
      "date": "2026-08-21T18:30:00.000Z",
      "grn": 1104,
      "billNo": "FFA/2026-27 /833",
      "supplierName": "FRESH FEEL APPARELS",
      "materialType": "Raw Material",
      "materialCategory": "Raw Material",
      "itemName": "HOOK-EYE 2x3 MICRO FIBER NYLON-SS 32-60MM NON BRUSHED-RELUX RFD",
      "receivedQuantity": 48e3,
      "checkedQuantity": 14400,
      "passQuantity": 48e3,
      "rejectedQuantity": 0,
      "itemRemarks": "PASS",
      "generalRemarks": "PASS",
      "zone": "KERALA",
      "location": "KERALA",
      "inspector": "PRATHEEKSHA",
      "id": "26c523fe-e252-4f89-971d-52a5ddbf07d5"
    },
    {
      "timestamp": "2026-08-21T10:21:01.993Z",
      "receivedDate": "2026-08-18T18:30:00.000Z",
      "checkingDate": "2026-08-20T18:30:00.000Z",
      "date": "2026-08-20T18:30:00.000Z",
      "grn": "I/R",
      "billNo": "G-0113/26-27",
      "supplierName": "BASKAR EMBROIDERY - TIRUPUR",
      "materialType": "Raw Material",
      "materialCategory": "Raw Material",
      "itemName": "HOOK-EYE 2x3 MICRO FIBER NYLON-SS 32-60MM NON BRUSHED-RELUX WHITE",
      "receivedQuantity": 11600,
      "checkedQuantity": 3500,
      "passQuantity": 11600,
      "rejectedQuantity": 0,
      "itemRemarks": "PASS",
      "generalRemarks": "PASS",
      "zone": "KERALA",
      "location": "KERALA",
      "inspector": "PRATHEEKSHA",
      "id": "f57ffd5f-fa48-45d5-9abe-33e783a60f89"
    },
    {
      "timestamp": "2026-08-21T10:21:01.993Z",
      "receivedDate": "2026-08-18T18:30:00.000Z",
      "checkingDate": "2026-08-20T18:30:00.000Z",
      "date": "2026-08-20T18:30:00.000Z",
      "grn": "I/R",
      "billNo": "G-0113/26-27",
      "supplierName": "BASKAR EMBROIDERY - TIRUPUR",
      "materialType": "Raw Material",
      "materialCategory": "Raw Material",
      "itemName": "HOOK-EYE 2x3 MICRO FIBER NYLON-SS 32-60MM NON BRUSHED-RELUX SLATE",
      "receivedQuantity": 3470,
      "checkedQuantity": 1e3,
      "passQuantity": 3470,
      "rejectedQuantity": 0,
      "itemRemarks": "PASS",
      "generalRemarks": "PASS",
      "zone": "KERALA",
      "location": "KERALA",
      "inspector": "PRATHEEKSHA",
      "id": "50cea3b8-5b64-4eb7-8389-b9506264a93e"
    },
    {
      "timestamp": "2026-08-21T10:21:01.993Z",
      "receivedDate": "2026-08-18T18:30:00.000Z",
      "checkingDate": "2026-08-20T18:30:00.000Z",
      "date": "2026-08-20T18:30:00.000Z",
      "grn": "I/R",
      "billNo": "G-0113/26-27",
      "supplierName": "BASKAR EMBROIDERY - TIRUPUR",
      "materialType": "Raw Material",
      "materialCategory": "Raw Material",
      "itemName": "HOOK-EYE 3x3 MICRO FIBER NYLON-SS 45-60MM NON BRUSHED-RELUX SEPLA ROSE",
      "receivedQuantity": 3430,
      "checkedQuantity": 1e3,
      "passQuantity": 3430,
      "rejectedQuantity": 0,
      "itemRemarks": "PASS",
      "generalRemarks": "PASS",
      "zone": "KERALA",
      "location": "KERALA",
      "inspector": "PRATHEEKSHA",
      "id": "81cde89d-81f5-4cbc-b28d-d1480f17d4ff"
    },
    {
      "timestamp": "2026-08-21T10:21:01.993Z",
      "receivedDate": "2026-08-18T18:30:00.000Z",
      "checkingDate": "2026-08-20T18:30:00.000Z",
      "date": "2026-08-20T18:30:00.000Z",
      "grn": "I/R",
      "billNo": "G-0113/26-27",
      "supplierName": "BASKAR EMBROIDERY - TIRUPUR",
      "materialType": "Raw Material",
      "materialCategory": "Raw Material",
      "itemName": "HOOK-EYE 3x3 MICRO FIBER NYLON-SS 45-60MM NON BRUSHED-RELUX SLATE",
      "receivedQuantity": 3420,
      "checkedQuantity": 1e3,
      "passQuantity": 3420,
      "rejectedQuantity": 0,
      "itemRemarks": "PASS",
      "generalRemarks": "PASS",
      "zone": "KERALA",
      "location": "KERALA",
      "inspector": "PRATHEEKSHA",
      "id": "0d04b3a2-de01-402a-a85b-67b7e226b8ae"
    },
    {
      "timestamp": "2026-08-21T10:21:01.993Z",
      "receivedDate": "2026-08-18T18:30:00.000Z",
      "checkingDate": "2026-08-20T18:30:00.000Z",
      "date": "2026-08-20T18:30:00.000Z",
      "grn": "I/R",
      "billNo": "G-0113/26-27",
      "supplierName": "BASKAR EMBROIDERY - TIRUPUR",
      "materialType": "Raw Material",
      "materialCategory": "Raw Material",
      "itemName": "HOOK-EYE 3x3 MICRO FIBER NYLON-SS 45-60MM NON BRUSHED-RELUX CORONET BLUE",
      "receivedQuantity": 3435,
      "checkedQuantity": 1e3,
      "passQuantity": 3435,
      "rejectedQuantity": 0,
      "itemRemarks": "PASS",
      "generalRemarks": "PASS",
      "zone": "KERALA",
      "location": "KERALA",
      "inspector": "PRATHEEKSHA",
      "id": "63b3ea06-4d34-4117-8ff8-c50feaa5aa24"
    },
    {
      "timestamp": "2026-08-21T04:38:55.013Z",
      "receivedDate": "2026-08-18T18:30:00.000Z",
      "checkingDate": "2026-08-20T18:30:00.000Z",
      "date": "2026-08-20T18:30:00.000Z",
      "grn": "I/R",
      "billNo": "G-0112/26-27",
      "supplierName": "BASKAR EMBROIDERY - TIRUPUR",
      "materialType": "Raw Material",
      "materialCategory": "Raw Material",
      "itemName": "HOOK-EYE 2x3 MICRO FIBER NYLON-SS 32-60MM NON BRUSHED-RELUX MEDIEVAL BLUE",
      "receivedQuantity": 4640,
      "checkedQuantity": 1392,
      "passQuantity": 4635,
      "rejectedQuantity": 5,
      "itemRemarks": "PASS",
      "generalRemarks": "PASS",
      "zone": "KERALA",
      "location": "KERALA",
      "inspector": "PRATHEEKSHA",
      "id": "e16cc1ff-146b-4dc0-b8e6-07bffc563ee0"
    },
    {
      "timestamp": "2026-08-21T04:31:13.896Z",
      "receivedDate": "2026-08-16T18:30:00.000Z",
      "checkingDate": "2026-08-19T18:30:00.000Z",
      "date": "2026-08-19T18:30:00.000Z",
      "grn": 1030,
      "billNo": "U/1324",
      "supplierName": "POLYELASTIC P LTD",
      "materialType": "Raw Material",
      "materialCategory": "Raw Material",
      "itemName": "ELASTIC NARROW WOVEN ARROW 84%NYLON 16%SPANDEX 18MM NUDE",
      "receivedQuantity": 1e4,
      "checkedQuantity": 3e3,
      "passQuantity": 1e4,
      "rejectedQuantity": 0,
      "itemRemarks": "PASS",
      "generalRemarks": "PASS",
      "zone": "KERALA",
      "location": "KERALA",
      "inspector": "PRATHEEKSHA",
      "id": "fd546473-9040-4986-ae83-3a9ad5d16fc3"
    },
    {
      "timestamp": "2026-08-21T04:31:13.896Z",
      "receivedDate": "2026-08-16T18:30:00.000Z",
      "checkingDate": "2026-08-19T18:30:00.000Z",
      "date": "2026-08-19T18:30:00.000Z",
      "grn": 1030,
      "billNo": "U/1324",
      "supplierName": "POLYELASTIC P LTD",
      "materialType": "Raw Material",
      "materialCategory": "Raw Material",
      "itemName": "ELASTIC NARROW WOVEN ARROW 84%NYLON 16%SPANDEX 14MM NUDE",
      "receivedQuantity": 26310,
      "checkedQuantity": 7893,
      "passQuantity": 26310,
      "rejectedQuantity": 0,
      "itemRemarks": "PASS",
      "generalRemarks": "PASS",
      "zone": "KERALA",
      "location": "KERALA",
      "inspector": "PRATHEEKSHA",
      "id": "79664954-94e5-4c7c-8141-489a6def06ec"
    },
    {
      "timestamp": "2026-08-21T04:31:13.896Z",
      "receivedDate": "2026-08-16T18:30:00.000Z",
      "checkingDate": "2026-08-19T18:30:00.000Z",
      "date": "2026-08-19T18:30:00.000Z",
      "grn": 1030,
      "billNo": "U/1324",
      "supplierName": "POLYELASTIC P LTD",
      "materialType": "Raw Material",
      "materialCategory": "Raw Material",
      "itemName": "ELASTIC MICRO NARROW WOVEN BUFF 84%NYLON 16%SPNDX 14MM\xA0SEPLA ROSE",
      "receivedQuantity": 5e3,
      "checkedQuantity": 1500,
      "passQuantity": 5e3,
      "rejectedQuantity": 0,
      "itemRemarks": "PASS",
      "generalRemarks": "PASS",
      "zone": "KERALA",
      "location": "KERALA",
      "inspector": "PRATHEEKSHA",
      "id": "510e646e-aa9f-4783-b82c-b350b7a4dab7"
    },
    {
      "timestamp": "2026-08-21T04:22:35.985Z",
      "receivedDate": "2026-08-13T18:30:00.000Z",
      "checkingDate": "2026-08-19T18:30:00.000Z",
      "date": "2026-08-19T18:30:00.000Z",
      "grn": 1018,
      "billNo": "SHE/E/2627/00059",
      "supplierName": "GINZA INDUSTRIES LTD",
      "materialType": "Raw Material",
      "materialCategory": "Raw Material",
      "itemName": "HOOK-EYE 2x3 MICRO FIBER NYLON-SS 32-60MM NON BRUSHED-RELUX NUDE",
      "receivedQuantity": 13200,
      "checkedQuantity": 3960,
      "passQuantity": 13200,
      "rejectedQuantity": 0,
      "itemRemarks": "PASS",
      "generalRemarks": "PASS",
      "zone": "KERALA",
      "location": "KERALA",
      "inspector": "PRATHEEKSHA",
      "id": "bda780c6-feef-4a26-ae06-19ee21588752"
    },
    {
      "timestamp": "2026-08-21T04:18:54.216Z",
      "receivedDate": "2026-08-07T18:30:00.000Z",
      "checkingDate": "2026-08-19T18:30:00.000Z",
      "date": "2026-08-19T18:30:00.000Z",
      "grn": 1007,
      "billNo": "ERD/TI/6122",
      "supplierName": "SHEELA FOAM LIMITED - ERODE",
      "materialType": "Raw Material",
      "materialCategory": "Raw Material",
      "itemName": "ACC PU-FOAM 32 DENSITY\xA0 6 MM WHITE",
      "receivedQuantity": 552,
      "checkedQuantity": 552,
      "passQuantity": 552,
      "rejectedQuantity": 0,
      "itemRemarks": "PASS",
      "generalRemarks": "PASS",
      "zone": "KERALA",
      "location": "KERALA",
      "inspector": "PRATHEEKSHA",
      "id": "1e3cdd6d-9fd1-4b8b-87e1-7135da0dc1ba"
    },
    {
      "timestamp": "2026-08-21T04:15:14.291Z",
      "receivedDate": "2026-08-17T18:30:00.000Z",
      "checkingDate": "2026-08-19T18:30:00.000Z",
      "date": "2026-08-19T18:30:00.000Z",
      "grn": 1063,
      "billNo": "KIPL2627IN02300",
      "supplierName": "KONIKA INTIMA PRIVATE LIMITED",
      "materialType": "Raw Material",
      "materialCategory": "Raw Material",
      "itemName": "ELASTIC MICRO NARROW WOVEN BUFF 84%NYLON 16%SPNDX 25MM MAROON",
      "receivedQuantity": 150,
      "checkedQuantity": 150,
      "passQuantity": 150,
      "rejectedQuantity": 0,
      "itemRemarks": "PASS",
      "generalRemarks": "PASS",
      "zone": "KERALA",
      "location": "KERALA",
      "inspector": "PRATHEEKSHA",
      "id": "49c33c57-5a20-4ac4-b435-452eb260d5ca"
    },
    {
      "timestamp": "2026-08-18T06:53:32.052Z",
      "receivedDate": "2026-08-11T18:30:00.000Z",
      "checkingDate": "2026-08-17T18:30:00.000Z",
      "date": "2026-08-17T18:30:00.000Z",
      "grn": 1019,
      "billNo": "KE/618",
      "supplierName": "KAKADIYA ENTERPRISE",
      "materialType": "Raw Material",
      "materialCategory": "Raw Material",
      "itemName": "ELASTIC MICRO NARROW WOVEN BUFF 84%NYLON 16%SPNDX 12MM\xA0 DEEP TAUPE",
      "receivedQuantity": 3290,
      "checkedQuantity": 900,
      "passQuantity": 3290,
      "rejectedQuantity": 0,
      "itemRemarks": "PASS",
      "generalRemarks": "PASS",
      "zone": "KERALA",
      "location": "KERALA",
      "inspector": "PRATHEEKSHA",
      "id": "f8f66e0c-0b04-44a8-84f8-be6a50bb6df6"
    },
    {
      "timestamp": "2026-08-18T06:53:32.052Z",
      "receivedDate": "2026-08-11T18:30:00.000Z",
      "checkingDate": "2026-08-17T18:30:00.000Z",
      "date": "2026-08-17T18:30:00.000Z",
      "grn": 1019,
      "billNo": "KE/618",
      "supplierName": "KAKADIYA ENTERPRISE",
      "materialType": "Raw Material",
      "materialCategory": "Raw Material",
      "itemName": "ELASTIC MICRO NARROW WOVEN BUFF 84%NYLON 16%SPNDX 12MM\xA0 WHITE",
      "receivedQuantity": 6e3,
      "checkedQuantity": 1600,
      "passQuantity": 6e3,
      "rejectedQuantity": 0,
      "itemRemarks": "PASS",
      "generalRemarks": "PASS",
      "zone": "KERALA",
      "location": "KERALA",
      "inspector": "PRATHEEKSHA",
      "id": "eb12cebf-3fa6-4c1d-ae8f-aeb9efedf1c9"
    },
    {
      "timestamp": "2026-08-18T06:53:32.052Z",
      "receivedDate": "2026-08-11T18:30:00.000Z",
      "checkingDate": "2026-08-17T18:30:00.000Z",
      "date": "2026-08-17T18:30:00.000Z",
      "grn": 1019,
      "billNo": "KE/618",
      "supplierName": "KAKADIYA ENTERPRISE",
      "materialType": "Raw Material",
      "materialCategory": "Raw Material",
      "itemName": "ELASTIC MICRO NARROW WOVEN BUFF 84%NYLON 16%SPNDX 14MM\xA0 DEEP TAPUE",
      "receivedQuantity": 5860,
      "checkedQuantity": 1600,
      "passQuantity": 5860,
      "rejectedQuantity": 0,
      "itemRemarks": "PASS",
      "generalRemarks": "PASS",
      "zone": "KERALA",
      "location": "KERALA",
      "inspector": "PRATHEEKSHA",
      "id": "26055c0b-ff25-4ada-b74b-3a88c14ad998"
    },
    {
      "timestamp": "2026-08-18T06:53:32.052Z",
      "receivedDate": "2026-08-11T18:30:00.000Z",
      "checkingDate": "2026-08-17T18:30:00.000Z",
      "date": "2026-08-17T18:30:00.000Z",
      "grn": 1019,
      "billNo": "KE/618",
      "supplierName": "KAKADIYA ENTERPRISE",
      "materialType": "Raw Material",
      "materialCategory": "Raw Material",
      "itemName": "ELASTIC MICRO NARROW WOVEN BUFF 84%NYLON 16%SPNDX 14MM\xA0 WHITE",
      "receivedQuantity": 4e3,
      "checkedQuantity": 1200,
      "passQuantity": 4e3,
      "rejectedQuantity": 0,
      "itemRemarks": "PASS",
      "generalRemarks": "PASS",
      "zone": "KERALA",
      "location": "KERALA",
      "inspector": "PRATHEEKSHA",
      "id": "87e08dd3-83a0-4b9a-aa34-3cc3744110fb"
    },
    {
      "timestamp": "2026-08-18T06:53:32.052Z",
      "receivedDate": "2026-08-11T18:30:00.000Z",
      "checkingDate": "2026-08-17T18:30:00.000Z",
      "date": "2026-08-17T18:30:00.000Z",
      "grn": 1019,
      "billNo": "KE/618",
      "supplierName": "KAKADIYA ENTERPRISE",
      "materialType": "Raw Material",
      "materialCategory": "Raw Material",
      "itemName": "ELASTIC MICRO NARROW WOVEN BUFF 84%NYLON 16%SPNDX 18MM DEEP TAUPE",
      "receivedQuantity": 4700,
      "checkedQuantity": 1e3,
      "passQuantity": 4700,
      "rejectedQuantity": 0,
      "itemRemarks": "PASS",
      "generalRemarks": "PASS",
      "zone": "KERALA",
      "location": "KERALA",
      "inspector": "PRATHEEKSHA",
      "id": "45284275-0d2e-4d1b-b357-cf50fb99f9e9"
    },
    {
      "timestamp": "2026-08-18T06:53:32.052Z",
      "receivedDate": "2026-08-11T18:30:00.000Z",
      "checkingDate": "2026-08-17T18:30:00.000Z",
      "date": "2026-08-17T18:30:00.000Z",
      "grn": 1019,
      "billNo": "KE/618",
      "supplierName": "KAKADIYA ENTERPRISE",
      "materialType": "Raw Material",
      "materialCategory": "Raw Material",
      "itemName": "ELASTIC MICRO NARROW WOVEN BUFF 84%NYLON 16%SPNDX 18MM\xA0 WHITE",
      "receivedQuantity": 5e3,
      "checkedQuantity": 1500,
      "passQuantity": 5e3,
      "rejectedQuantity": 0,
      "itemRemarks": "PASS",
      "generalRemarks": "PASS",
      "zone": "KERALA",
      "location": "KERALA",
      "inspector": "PRATHEEKSHA",
      "id": "b0f690a6-2e5f-4ad6-b8c5-e971b998639b"
    },
    {
      "timestamp": "2026-08-18T06:48:56.578Z",
      "receivedDate": "2026-07-27T18:30:00.000Z",
      "checkingDate": "2026-08-06T18:30:00.000Z",
      "date": "2026-08-06T18:30:00.000Z",
      "grn": 829,
      "billNo": "260/26-27",
      "supplierName": "STRAPTEX (I) P LTD",
      "materialType": "Raw Material",
      "materialCategory": "Raw Material",
      "itemName": "ELASTIC NARROW WOVEN 84%NYLON 16%RUBBER 32MM NUDE",
      "receivedQuantity": 3025,
      "checkedQuantity": 900,
      "passQuantity": 2125,
      "rejectedQuantity": 0,
      "itemRemarks": "WIDTH VARIATION & EDGE FINISHING ISSUE",
      "generalRemarks": "PASS",
      "zone": "KERALA",
      "location": "KERALA",
      "inspector": "PRATHEEKSHA",
      "id": "7013008f-486c-4c10-8164-15798705ba2d"
    },
    {
      "timestamp": "2026-08-18T06:44:04.514Z",
      "receivedDate": "2026-02-04T18:30:00.000Z",
      "checkingDate": "2026-08-10T18:30:00.000Z",
      "date": "2026-08-10T18:30:00.000Z",
      "grn": 923,
      "billNo": "304/26-27",
      "supplierName": "STRAPTEX (I) P LTD",
      "materialType": "Raw Material",
      "materialCategory": "Raw Material",
      "itemName": "ELASTIC NARROW WOVEN 84%NYLON 16%RUBBER 25MM NUDE",
      "receivedQuantity": 5700,
      "checkedQuantity": 1700,
      "passQuantity": 3850,
      "rejectedQuantity": 1850,
      "itemRemarks": "PO EXCESS & COMPLAINT",
      "generalRemarks": "PASS",
      "zone": "KERALA",
      "location": "KERALA",
      "inspector": "PRATHEEKSHA",
      "id": "5f349704-7df6-4ed7-a642-c46df2791cee"
    },
    {
      "timestamp": "2026-08-18T06:41:34.204Z",
      "receivedDate": "2026-08-13T18:30:00.000Z",
      "checkingDate": "2026-08-17T18:30:00.000Z",
      "date": "2026-08-17T18:30:00.000Z",
      "grn": 1017,
      "billNo": 1397,
      "supplierName": "SACHINAM FABRICS PVT LTD",
      "materialType": "Raw Material",
      "materialCategory": "Raw Material",
      "itemName": "ELASTIC MICRO NARROW WOVEN BUFF 84%NYLON 16%SPNDX 14MM BLACK",
      "receivedQuantity": 5e3,
      "checkedQuantity": 1500,
      "passQuantity": 5e3,
      "rejectedQuantity": 0,
      "itemRemarks": "PASS",
      "generalRemarks": "PASS",
      "zone": "KERALA",
      "location": "KERALA",
      "inspector": "PRATHEEKSHA",
      "id": "9d850b1d-da5f-4fbd-9a51-96e54c9ba13d"
    },
    {
      "timestamp": "2026-08-18T06:41:34.204Z",
      "receivedDate": "2026-08-13T18:30:00.000Z",
      "checkingDate": "2026-08-17T18:30:00.000Z",
      "date": "2026-08-17T18:30:00.000Z",
      "grn": 1017,
      "billNo": 1397,
      "supplierName": "SACHINAM FABRICS PVT LTD",
      "materialType": "Raw Material",
      "materialCategory": "Raw Material",
      "itemName": "ELASTIC MICRO NARROW WOVEN BUFF 84%NYLON 16%SPNDX 14MM\xA0 WHITE",
      "receivedQuantity": 5e3,
      "checkedQuantity": 1500,
      "passQuantity": 5e3,
      "rejectedQuantity": 0,
      "itemRemarks": "PASS",
      "generalRemarks": "PASS",
      "zone": "KERALA",
      "location": "KERALA",
      "inspector": "PRATHEEKSHA",
      "id": "54b4f323-f89b-4813-adc0-d138131bd004"
    },
    {
      "timestamp": "2026-08-17T11:47:20.328Z",
      "receivedDate": "2026-08-16T18:30:00.000Z",
      "checkingDate": "2026-08-16T18:30:00.000Z",
      "date": "2026-08-16T18:30:00.000Z",
      "grn": 1027,
      "billNo": "KIPL2627INVO2349",
      "supplierName": "KONIKA INTIMA PRIVATE LIMITED",
      "materialType": "Raw Material",
      "materialCategory": "Raw Material",
      "itemName": "ELASTIC NARROW WOVEN 84%NYLON 16% SPANDEX 32MM MAROON",
      "receivedQuantity": 1040,
      "checkedQuantity": 300,
      "passQuantity": 1040,
      "rejectedQuantity": 0,
      "itemRemarks": "PASS",
      "generalRemarks": "PASS",
      "zone": "KERALA",
      "location": "KERALA",
      "inspector": "PRATHEEKSHA",
      "id": "120607e0-3db4-44a1-865f-7bcd3aadc0a8"
    },
    {
      "timestamp": "2026-08-17T11:44:54.434Z",
      "receivedDate": "2026-08-06T18:30:00.000Z",
      "checkingDate": "2026-08-16T18:30:00.000Z",
      "date": "2026-08-16T18:30:00.000Z",
      "grn": 993,
      "billNo": 78,
      "supplierName": "VGS CLOTHING",
      "materialType": "Raw Material",
      "materialCategory": "Raw Material",
      "itemName": "CLOTH KTD SJ 100%CTN 34s 135GSM 36INCH TUBULAR WHITE",
      "receivedQuantity": 310.6,
      "checkedQuantity": 100,
      "passQuantity": 310.6,
      "rejectedQuantity": 0,
      "itemRemarks": "PASS",
      "generalRemarks": "PASS",
      "zone": "KERALA",
      "location": "KERALA",
      "inspector": "PRATHEEKSHA",
      "id": "507d9331-047a-40f4-9382-bdffea5da173"
    },
    {
      "timestamp": "2026-08-17T11:44:54.434Z",
      "receivedDate": "2026-08-06T18:30:00.000Z",
      "checkingDate": "2026-08-16T18:30:00.000Z",
      "date": "2026-08-16T18:30:00.000Z",
      "grn": 993,
      "billNo": 78,
      "supplierName": "VGS CLOTHING",
      "materialType": "Raw Material",
      "materialCategory": "Raw Material",
      "itemName": "CLOTH KTD SJ 100%CTN 36s 130GSM 36INCH TUBULAR CARBON",
      "receivedQuantity": 56.5,
      "checkedQuantity": 15,
      "passQuantity": 56.5,
      "rejectedQuantity": 0,
      "itemRemarks": "PASS",
      "generalRemarks": "PASS",
      "zone": "KERALA",
      "location": "KERALA",
      "inspector": "PRATHEEKSHA",
      "id": "0589d6ae-27f1-4a05-a598-ad51db071e3d"
    },
    {
      "timestamp": "2026-08-17T11:44:54.434Z",
      "receivedDate": "2026-08-06T18:30:00.000Z",
      "checkingDate": "2026-08-16T18:30:00.000Z",
      "date": "2026-08-16T18:30:00.000Z",
      "grn": 993,
      "billNo": 78,
      "supplierName": "VGS CLOTHING",
      "materialType": "Raw Material",
      "materialCategory": "Raw Material",
      "itemName": "CLOTH KTD SJ 100%CTN 34S 135GSM 36INCH TUBULAR CORONET BLUE",
      "receivedQuantity": 95.8,
      "checkedQuantity": 100,
      "passQuantity": 95.8,
      "rejectedQuantity": 0,
      "itemRemarks": "PASS",
      "generalRemarks": "PASS",
      "zone": "KERALA",
      "location": "KERALA",
      "inspector": "PRATHEEKSHA",
      "id": "1f102df5-54e7-40d0-a750-903422edc8d3"
    },
    {
      "timestamp": "2026-08-17T11:44:54.434Z",
      "receivedDate": "2026-08-06T18:30:00.000Z",
      "checkingDate": "2026-08-16T18:30:00.000Z",
      "date": "2026-08-16T18:30:00.000Z",
      "grn": 993,
      "billNo": 78,
      "supplierName": "VGS CLOTHING",
      "materialType": "Raw Material",
      "materialCategory": "Raw Material",
      "itemName": "CLOTH KTD SJ 100%CTN 34s 135GSM 36INCH TUBULAR NUDE",
      "receivedQuantity": 204.2,
      "checkedQuantity": 60,
      "passQuantity": 204.2,
      "rejectedQuantity": 0,
      "itemRemarks": "PASS",
      "generalRemarks": "PASS",
      "zone": "KERALA",
      "location": "KERALA",
      "inspector": "PRATHEEKSHA",
      "id": "a6f15aba-e12c-4bf0-beef-b7669cd4133f"
    },
    {
      "timestamp": "2026-08-17T11:44:54.434Z",
      "receivedDate": "2026-08-06T18:30:00.000Z",
      "checkingDate": "2026-08-16T18:30:00.000Z",
      "date": "2026-08-16T18:30:00.000Z",
      "grn": 993,
      "billNo": 78,
      "supplierName": "VGS CLOTHING",
      "materialType": "Raw Material",
      "materialCategory": "Raw Material",
      "itemName": "CLOTH KTD SJ 100%CTN 34S 135GSM 36INCH TUBULAR SEPLA ROSE",
      "receivedQuantity": 94.2,
      "checkedQuantity": 100,
      "passQuantity": 94.5,
      "rejectedQuantity": 0,
      "itemRemarks": "PASS",
      "generalRemarks": "PASS",
      "zone": "KERALA",
      "location": "KERALA",
      "inspector": "PRATHEEKSHA",
      "id": "aea98964-ad03-4496-961a-65ac4e4c1fb3"
    },
    {
      "timestamp": "2026-08-17T11:44:54.434Z",
      "receivedDate": "2026-08-06T18:30:00.000Z",
      "checkingDate": "2026-08-16T18:30:00.000Z",
      "date": "2026-08-16T18:30:00.000Z",
      "grn": 993,
      "billNo": 78,
      "supplierName": "VGS CLOTHING",
      "materialType": "Raw Material",
      "materialCategory": "Raw Material",
      "itemName": "CLOTH KTD SJ 100%CTN 34S 135GSM 36INCH TUBULAR SLATE",
      "receivedQuantity": 94.1,
      "checkedQuantity": 100,
      "passQuantity": 94.1,
      "rejectedQuantity": 0,
      "itemRemarks": "PASS",
      "generalRemarks": "PASS",
      "zone": "KERALA",
      "location": "KERALA",
      "inspector": "PRATHEEKSHA",
      "id": "c989358f-4c7d-4ef6-b8b2-0a84fc754ac2"
    },
    {
      "timestamp": "2026-08-17T11:41:28.186Z",
      "receivedDate": "2026-08-07T18:30:00.000Z",
      "checkingDate": "2026-08-16T18:30:00.000Z",
      "date": "2026-08-16T18:30:00.000Z",
      "grn": 955,
      "billNo": "NIIL/26-27/0580",
      "supplierName": "NILESH IMPEX INDIA PRIVATE LIMITED",
      "materialType": "Raw Material",
      "materialCategory": "Raw Material",
      "itemName": "CLOTH WOVEN HACOBA MN 4185  100%CTN 40S 132 MAROON",
      "receivedQuantity": 175.5,
      "checkedQuantity": 52.65,
      "passQuantity": 175.5,
      "rejectedQuantity": 0,
      "itemRemarks": "PASS",
      "generalRemarks": "PASS",
      "zone": "KERALA",
      "location": "KERALA",
      "inspector": "PRATHEEKSHA",
      "id": "0bd03ccd-9c94-4597-80d5-8dccc249d0fb"
    },
    {
      "timestamp": "2026-08-17T11:41:28.186Z",
      "receivedDate": "2026-08-07T18:30:00.000Z",
      "checkingDate": "2026-08-16T18:30:00.000Z",
      "date": "2026-08-16T18:30:00.000Z",
      "grn": 955,
      "billNo": "NIIL/26-27/0580",
      "supplierName": "NILESH IMPEX INDIA PRIVATE LIMITED",
      "materialType": "Raw Material",
      "materialCategory": "Raw Material",
      "itemName": "CLOTH WOVEN HACOBA MN 4185  100%CTN 40S 132 CORONET BLUE",
      "receivedQuantity": 175.5,
      "checkedQuantity": 52.65,
      "passQuantity": 175.5,
      "rejectedQuantity": 0,
      "itemRemarks": "PASS",
      "generalRemarks": "PASS",
      "zone": "KERALA",
      "location": "KERALA",
      "inspector": "PRATHEEKSHA",
      "id": "4f33bdb8-f953-48e7-a8b3-5d85e815eda5"
    },
    {
      "timestamp": "2026-08-17T08:25:27.502Z",
      "receivedDate": "2026-08-13T18:30:00.000Z",
      "checkingDate": "2026-08-16T18:30:00.000Z",
      "date": "2026-08-16T18:30:00.000Z",
      "grn": 1016,
      "billNo": "KIPL2627INVO2241",
      "supplierName": "KONIKA INTIMA PRIVATE LIMITED",
      "materialType": "Raw Material",
      "materialCategory": "Raw Material",
      "itemName": "ELASTIC NARROW WOVEN 84%NYLON 16%SPANDEX 25MM BURL WOOD",
      "receivedQuantity": 850,
      "checkedQuantity": 300,
      "passQuantity": 850,
      "rejectedQuantity": 0,
      "itemRemarks": "PASS",
      "generalRemarks": "PASS",
      "zone": "KERALA",
      "location": "KERALA",
      "inspector": "PRATHEEKSHA",
      "id": "b9bb746e-9009-43b1-a0f4-d4e433e5788a"
    },
    {
      "timestamp": "2026-08-17T08:25:27.502Z",
      "receivedDate": "2026-08-13T18:30:00.000Z",
      "checkingDate": "2026-08-16T18:30:00.000Z",
      "date": "2026-08-16T18:30:00.000Z",
      "grn": 1016,
      "billNo": "KIPL2627INVO2241",
      "supplierName": "KONIKA INTIMA PRIVATE LIMITED",
      "materialType": "Raw Material",
      "materialCategory": "Raw Material",
      "itemName": "ELASTIC NARROW WOVEN 84%NYLON 16%SPANDEX 25MM CORONET BLUE",
      "receivedQuantity": 600,
      "checkedQuantity": 180,
      "passQuantity": 600,
      "rejectedQuantity": 0,
      "itemRemarks": "PASS",
      "generalRemarks": "PASS",
      "zone": "KERALA",
      "location": "KERALA",
      "inspector": "PRATHEEKSHA",
      "id": "6a5ba860-d5fa-4824-bcee-893ca04db539"
    },
    {
      "timestamp": "2026-08-17T08:25:27.502Z",
      "receivedDate": "2026-08-13T18:30:00.000Z",
      "checkingDate": "2026-08-16T18:30:00.000Z",
      "date": "2026-08-16T18:30:00.000Z",
      "grn": 1016,
      "billNo": "KIPL2627INVO2241",
      "supplierName": "KONIKA INTIMA PRIVATE LIMITED",
      "materialType": "Raw Material",
      "materialCategory": "Raw Material",
      "itemName": "ELASTIC NARROW WOVEN 84%NYLON 16%SPANDEX 25MM DEEP TAUPE",
      "receivedQuantity": 930,
      "checkedQuantity": 360,
      "passQuantity": 930,
      "rejectedQuantity": 0,
      "itemRemarks": "PASS",
      "generalRemarks": "PASS",
      "zone": "KERALA",
      "location": "KERALA",
      "inspector": "PRATHEEKSHA",
      "id": "764faa09-900f-4835-941e-b4e0abdbfd16"
    },
    {
      "timestamp": "2026-08-17T07:57:51.945Z",
      "receivedDate": "2026-07-31T18:30:00.000Z",
      "checkingDate": "2026-08-16T18:30:00.000Z",
      "date": "2026-08-16T18:30:00.000Z",
      "grn": 887,
      "billNo": "NIIPL/26-27/0550",
      "supplierName": "NILESH IMPEX INDIA PRIVATE LIMITED",
      "materialType": "Raw Material",
      "materialCategory": "Raw Material",
      "itemName": "CLOTH WOVEN HACOBA MN 4185  100%CTN 40S 132 MAROON",
      "receivedQuantity": 13.5,
      "checkedQuantity": 4,
      "passQuantity": 13.5,
      "rejectedQuantity": 0,
      "itemRemarks": "PASS",
      "generalRemarks": "pass",
      "zone": "KERALA",
      "location": "KERALA",
      "inspector": "PRATHEEKSHA",
      "id": "0e383923-9eb2-4ad1-ac28-3389c8ea432d"
    },
    {
      "timestamp": "2026-08-17T07:57:51.945Z",
      "receivedDate": "2026-07-31T18:30:00.000Z",
      "checkingDate": "2026-08-16T18:30:00.000Z",
      "date": "2026-08-16T18:30:00.000Z",
      "grn": 887,
      "billNo": "NIIPL/26-27/0550",
      "supplierName": "NILESH IMPEX INDIA PRIVATE LIMITED",
      "materialType": "Raw Material",
      "materialCategory": "Raw Material",
      "itemName": "CLOTH WOVEN HACOBA MN 4185  100%CTN 40S 132 CORONET BLUE",
      "receivedQuantity": 13.5,
      "checkedQuantity": 4,
      "passQuantity": 13.5,
      "rejectedQuantity": 0,
      "itemRemarks": "pass",
      "generalRemarks": "pass",
      "zone": "KERALA",
      "location": "KERALA",
      "inspector": "PRATHEEKSHA",
      "id": "e6b19af5-2060-4f66-b878-76b9a7266747"
    },
    {
      "timestamp": "2026-08-17T07:53:34.027Z",
      "receivedDate": "2026-08-11T18:30:00.000Z",
      "checkingDate": "2026-08-16T18:30:00.000Z",
      "date": "2026-08-16T18:30:00.000Z",
      "grn": 992,
      "billNo": "NIIPL/26-27/0600",
      "supplierName": "NILESH IMPEX INDIA PRIVATE LIMITED",
      "materialType": "Raw Material",
      "materialCategory": "Raw Material",
      "itemName": "CLOTH WOVEN 132 EPI-72PPI 100%CTN 40S 125GSM 58INCH NUDE",
      "receivedQuantity": 13.7,
      "checkedQuantity": 4,
      "passQuantity": 0,
      "rejectedQuantity": 13.7,
      "itemRemarks": "WRINGLES",
      "generalRemarks": "FAIL",
      "zone": "KERALA",
      "location": "KERALA",
      "inspector": "PRATHEEKSHA",
      "id": "3bd8ec61-0c02-4d26-86e3-f8276141ddc6"
    },
    {
      "timestamp": "2026-08-17T07:53:34.027Z",
      "receivedDate": "2026-08-11T18:30:00.000Z",
      "checkingDate": "2026-08-16T18:30:00.000Z",
      "date": "2026-08-16T18:30:00.000Z",
      "grn": 992,
      "billNo": "NIIPL/26-27/0600",
      "supplierName": "NILESH IMPEX INDIA PRIVATE LIMITED",
      "materialType": "Raw Material",
      "materialCategory": "Raw Material",
      "itemName": "CLOTH WOVEN HACOBA MN 4185  100%CTN 40S 132BURLWOOD",
      "receivedQuantity": 13.7,
      "checkedQuantity": 4,
      "passQuantity": 0,
      "rejectedQuantity": 13.7,
      "itemRemarks": "WRINGLES",
      "generalRemarks": "FAIL",
      "zone": "KERALA",
      "location": "KERALA",
      "inspector": "PRATHEEKSHA",
      "id": "c59302ae-55d0-4328-a3d4-67bfe2783f49"
    },
    {
      "timestamp": "2026-08-17T07:53:34.027Z",
      "receivedDate": "2026-08-11T18:30:00.000Z",
      "checkingDate": "2026-08-16T18:30:00.000Z",
      "date": "2026-08-16T18:30:00.000Z",
      "grn": 992,
      "billNo": "NIIPL/26-27/0600",
      "supplierName": "NILESH IMPEX INDIA PRIVATE LIMITED",
      "materialType": "Raw Material",
      "materialCategory": "Raw Material",
      "itemName": "CLOTH WOVEN HACOBA MN 4185  100%CTN 40S 132SEPLA ROSE",
      "receivedQuantity": 13.6,
      "checkedQuantity": 4,
      "passQuantity": 0,
      "rejectedQuantity": 13.6,
      "itemRemarks": "WRINGLES",
      "generalRemarks": "FAIL",
      "zone": "KERALA",
      "location": "KERALA",
      "inspector": "PRATHEEKSHA",
      "id": "1e5c2198-ab27-4736-afc1-1e66bd202979"
    },
    {
      "timestamp": "2026-08-17T06:54:05.156Z",
      "receivedDate": "2026-07-20T18:30:00.000Z",
      "checkingDate": "2026-08-16T18:30:00.000Z",
      "date": "2026-08-16T18:30:00.000Z",
      "grn": 759,
      "billNo": "TRF27KT/200152",
      "supplierName": "BLOSSOM INNERS PVT LTD - BANGLORE",
      "materialType": "Raw Material",
      "materialCategory": "Raw Material",
      "itemName": "HOOK-EYE 2*3 MICRO FIBRE NYLON-SS 32-60MM NON BRUSHED-RELUX MAROON",
      "receivedQuantity": 10900,
      "checkedQuantity": 3e3,
      "passQuantity": 550,
      "rejectedQuantity": 10320,
      "itemRemarks": "COMMERCIAL PASS",
      "generalRemarks": "REJECTED ",
      "zone": "KERALA",
      "location": "KERALA",
      "inspector": "PRATHEEKSHA",
      "id": "6e5fbbd6-c1ad-4839-93fe-50f8ed7ff2cf"
    },
    {
      "timestamp": "2026-08-17T06:54:05.156Z",
      "receivedDate": "2026-07-20T18:30:00.000Z",
      "checkingDate": "2026-08-16T18:30:00.000Z",
      "date": "2026-08-16T18:30:00.000Z",
      "grn": 759,
      "billNo": "TRF27KT/200152",
      "supplierName": "BLOSSOM INNERS PVT LTD - BANGLORE",
      "materialType": "Raw Material",
      "materialCategory": "Raw Material",
      "itemName": "HOOK-EYE 3*3 MICRO FIBER NYLON-SS 44-55MM NON BRUSHED-RELUX MAROON",
      "receivedQuantity": 5250,
      "checkedQuantity": 1500,
      "passQuantity": 0,
      "rejectedQuantity": 5250,
      "itemRemarks": "FAIL",
      "generalRemarks": "REJECTED ",
      "zone": "KERALA",
      "location": "KERALA",
      "inspector": "PRATHEEKSHA",
      "id": "5bd0cb76-6e97-4c37-b1f2-8b0a8fdef86c"
    },
    {
      "timestamp": "2026-08-14T06:00:58.111Z",
      "receivedDate": "2026-08-11T18:30:00.000Z",
      "checkingDate": "2026-08-13T18:30:00.000Z",
      "date": "2026-08-13T18:30:00.000Z",
      "grn": 991,
      "billNo": "AC/26-27 /266",
      "supplierName": "ASSOCIATED CLOTHINGS",
      "materialType": "Raw Material",
      "materialCategory": "Raw Material",
      "itemName": "ACC STRAP 100% CTN 14MM WHITE",
      "receivedQuantity": 1632,
      "checkedQuantity": 489.6,
      "passQuantity": 1632,
      "rejectedQuantity": 0,
      "itemRemarks": "PASS",
      "generalRemarks": "PASS",
      "zone": "KERALA",
      "location": "KERALA",
      "inspector": "PRATHEEKSHA",
      "id": "392cdb8b-facd-49d7-999c-e81c790060f0"
    },
    {
      "timestamp": "2026-08-14T05:58:58.488Z",
      "receivedDate": "2026-08-11T18:30:00.000Z",
      "checkingDate": "2026-08-13T18:30:00.000Z",
      "date": "2026-08-13T18:30:00.000Z",
      "grn": 982,
      "billNo": "FFA/2026-27 /778",
      "supplierName": "FRESH FEEL APPARELS",
      "materialType": "Raw Material",
      "materialCategory": "Raw Material",
      "itemName": "HOOK-EYE 2x3 MICRO FIBER NYLON-SS 32-60MM NON BRUSHED-RELUX RFD",
      "receivedQuantity": 12e3,
      "checkedQuantity": 3600,
      "passQuantity": 12e3,
      "rejectedQuantity": 0,
      "itemRemarks": "PASS",
      "generalRemarks": "PASS",
      "zone": "KERALA",
      "location": "KERALA",
      "inspector": "PRATHEEKSHA",
      "id": "4dcd5fb0-3b4b-4534-b656-de308d7cbc8d"
    },
    {
      "timestamp": "2026-08-14T05:55:16.977Z",
      "receivedDate": "2026-08-11T18:30:00.000Z",
      "checkingDate": "2026-08-13T18:30:00.000Z",
      "date": "2026-08-13T18:30:00.000Z",
      "grn": 983,
      "billNo": "FFA/2026-27/785",
      "supplierName": "FRESH FEEL APPARELS",
      "materialType": "Raw Material",
      "materialCategory": "Raw Material",
      "itemName": "HOOK-EYE 2x3 MICRO FIBER NYLON-SS 32-60MM NON BRUSHED-RELUX RFD",
      "receivedQuantity": 24e3,
      "checkedQuantity": 7200,
      "passQuantity": 24e3,
      "rejectedQuantity": 0,
      "itemRemarks": "PASS",
      "generalRemarks": "PASS",
      "zone": "KERALA",
      "location": "KERALA",
      "inspector": "PRATHEEKSHA",
      "id": "1bc6daf3-6c54-48fd-8d13-f3a92c6d87f7"
    },
    {
      "timestamp": "2026-08-12T11:59:06.690Z",
      "receivedDate": "2026-08-03T18:30:00.000Z",
      "checkingDate": "2026-08-11T18:30:00.000Z",
      "date": "2026-08-11T18:30:00.000Z",
      "grn": 905,
      "billNo": "LBF260002832",
      "supplierName": "VARDHMAN TEXTILES LIMITED",
      "materialType": "Raw Material",
      "materialCategory": "Raw Material",
      "itemName": "CLOTH WOVEN 140324 136 EPI-72 PPI\xA0 96% Cotton 4% Spandex 40*40 Spandex 135 GSM 48 INCH Width\xA0NUDE",
      "receivedQuantity": 1023,
      "checkedQuantity": 300,
      "passQuantity": 1023,
      "rejectedQuantity": 0,
      "itemRemarks": "PASS",
      "generalRemarks": "PASS",
      "zone": "KERALA",
      "location": "KERALA",
      "inspector": "PRATHEEKSHA",
      "id": "d9ea345b-cc7f-454a-942f-cfedfa1e401d"
    },
    {
      "timestamp": "2026-08-12T11:59:06.690Z",
      "receivedDate": "2026-08-03T18:30:00.000Z",
      "checkingDate": "2026-08-11T18:30:00.000Z",
      "date": "2026-08-11T18:30:00.000Z",
      "grn": 905,
      "billNo": "LBF260002832",
      "supplierName": "VARDHMAN TEXTILES LIMITED",
      "materialType": "Raw Material",
      "materialCategory": "Raw Material",
      "itemName": "CLOTH WOVEN 140324 136 EPI-72 PPI\xA0 96% Cotton 4% 40*40 Spandex 135 GSM 48 INCH Width\xA0CORONET BLUE",
      "receivedQuantity": 1015,
      "checkedQuantity": 300,
      "passQuantity": 1015,
      "rejectedQuantity": 0,
      "itemRemarks": "PASS",
      "generalRemarks": "PASS",
      "zone": "KERALA",
      "location": "KERALA",
      "inspector": "PRATHEEKSHA",
      "id": "6845286b-6e13-47ba-b3b7-afb02400eae6"
    },
    {
      "timestamp": "2026-08-12T11:59:06.690Z",
      "receivedDate": "2026-08-03T18:30:00.000Z",
      "checkingDate": "2026-08-11T18:30:00.000Z",
      "date": "2026-08-11T18:30:00.000Z",
      "grn": 905,
      "billNo": "LBF260002832",
      "supplierName": "VARDHMAN TEXTILES LIMITED",
      "materialType": "Raw Material",
      "materialCategory": "Raw Material",
      "itemName": "CLOTH WOVEN 140324 136 EPI-72 PPI\xA0 96% Cotton 4% 40*40 Spandex 135 GSM 48 INCH Width\xA0SLATE",
      "receivedQuantity": 1022,
      "checkedQuantity": 300,
      "passQuantity": 1022,
      "rejectedQuantity": 0,
      "itemRemarks": "PASS",
      "generalRemarks": "PASS",
      "zone": "KERALA",
      "location": "KERALA",
      "inspector": "PRATHEEKSHA",
      "id": "e6df1a9f-13a8-407b-a4ea-086de5c5daa8"
    },
    {
      "timestamp": "2026-08-12T05:11:44.536Z",
      "receivedDate": "2026-08-04T18:30:00.000Z",
      "checkingDate": "2026-08-10T18:30:00.000Z",
      "date": "2026-08-10T18:30:00.000Z",
      "grn": 923,
      "billNo": 304,
      "supplierName": "STRAPTEX (I) P LTD",
      "materialType": "Raw Material",
      "materialCategory": "Raw Material",
      "itemName": "ELASTIC NARROW WOVEN 84%NYLON 16%RUBBER 25MM NUDE",
      "receivedQuantity": 5700,
      "checkedQuantity": 1710,
      "passQuantity": 3850,
      "rejectedQuantity": 1850,
      "itemRemarks": "PASS",
      "generalRemarks": "PASS",
      "zone": "KERALA",
      "location": "KERALA",
      "inspector": "PRATHEEKSHA",
      "id": "c35ab84c-1849-4350-b500-a6be566d4bcf"
    },
    {
      "timestamp": "2026-08-12T05:11:11.039Z",
      "receivedDate": "2026-08-04T18:30:00.000Z",
      "checkingDate": "2026-08-10T18:30:00.000Z",
      "date": "2026-08-10T18:30:00.000Z",
      "grn": 923,
      "billNo": 304,
      "supplierName": "STRAPTEX (I) P LTD",
      "materialType": "Raw Material",
      "materialCategory": "Raw Material",
      "itemName": "ELASTIC NARROW WOVEN 84%NYLON 16%RUBBER 25MM NUDE",
      "receivedQuantity": 5700,
      "checkedQuantity": 1710,
      "passQuantity": 3850,
      "rejectedQuantity": 1850,
      "itemRemarks": "PASS",
      "generalRemarks": "PASS",
      "zone": "KERALA",
      "location": "KERALA",
      "inspector": "PRATHEEKSHA",
      "id": "cb4cf69e-c3cc-4e0f-a2b1-6a6ad8cc0dd3"
    },
    {
      "timestamp": "2026-08-11T10:44:33.535Z",
      "receivedDate": "2026-07-27T18:30:00.000Z",
      "checkingDate": "2026-08-09T18:30:00.000Z",
      "date": "2026-08-09T18:30:00.000Z",
      "grn": 873,
      "billNo": "246/26-27",
      "supplierName": "STRAPTEX (I) P LTD",
      "materialType": "Raw Material",
      "materialCategory": "Raw Material",
      "itemName": "ELASTIC NARROW WOVEN 84%NYLON 16%RUBBER 32MM WHITE",
      "receivedQuantity": 1500,
      "checkedQuantity": 450,
      "passQuantity": 1350,
      "rejectedQuantity": 150,
      "itemRemarks": "PASS",
      "generalRemarks": "PASS",
      "zone": "KERALA",
      "location": "KERALA",
      "inspector": "PRATHEEKSHA",
      "id": "c7b45a57-351f-4de3-ab59-48645cce62ba"
    },
    {
      "timestamp": "2026-08-11T10:44:33.535Z",
      "receivedDate": "2026-07-27T18:30:00.000Z",
      "checkingDate": "2026-08-09T18:30:00.000Z",
      "date": "2026-08-09T18:30:00.000Z",
      "grn": 873,
      "billNo": "246/26-27",
      "supplierName": "STRAPTEX (I) P LTD",
      "materialType": "Raw Material",
      "materialCategory": "Raw Material",
      "itemName": "ELASTIC NARROW WOVEN 84%NYLON 16%RUBBER 25MM WHITE",
      "receivedQuantity": 1500,
      "checkedQuantity": 450,
      "passQuantity": 1500,
      "rejectedQuantity": 0,
      "itemRemarks": "PASS",
      "generalRemarks": "PASS",
      "zone": "KERALA",
      "location": "KERALA",
      "inspector": "PRATHEEKSHA",
      "id": "bd308b56-1d0d-4039-ba79-43df08209271"
    },
    {
      "timestamp": "2026-08-11T09:45:12.350Z",
      "receivedDate": "2026-08-03T18:30:00.000Z",
      "checkingDate": "2026-08-10T18:30:00.000Z",
      "date": "2026-08-10T18:30:00.000Z",
      "grn": 925,
      "billNo": "JNF-226 /2026-27",
      "supplierName": "JAIN NARROW FABS",
      "materialType": "Raw Material",
      "materialCategory": "Raw Material",
      "itemName": "TAPE PLSTR JULIE LACE 10MM NUDE",
      "receivedQuantity": 4800,
      "checkedQuantity": 1440,
      "passQuantity": 4800,
      "rejectedQuantity": 0,
      "itemRemarks": "PASS",
      "generalRemarks": "PASS",
      "zone": "KERALA",
      "location": "KERALA",
      "inspector": "PRATHEEKSHA",
      "id": "fbd75480-0a12-4fc9-99b1-76accff4fcb0"
    },
    {
      "timestamp": "2026-08-11T09:45:12.350Z",
      "receivedDate": "2026-08-03T18:30:00.000Z",
      "checkingDate": "2026-08-10T18:30:00.000Z",
      "date": "2026-08-10T18:30:00.000Z",
      "grn": 925,
      "billNo": "JNF-226 /2026-27",
      "supplierName": "JAIN NARROW FABS",
      "materialType": "Raw Material",
      "materialCategory": "Raw Material",
      "itemName": "TAPE PLSTR JULIE LACE 10MM WHITE",
      "receivedQuantity": 10200,
      "checkedQuantity": 3060,
      "passQuantity": 10200,
      "rejectedQuantity": 0,
      "itemRemarks": "PASS",
      "generalRemarks": "PASS",
      "zone": "KERALA",
      "location": "KERALA",
      "inspector": "PRATHEEKSHA",
      "id": "9c81cf6f-ec13-4053-bf3d-2357e2b95884"
    },
    {
      "timestamp": "2026-08-10T10:36:35.818Z",
      "receivedDate": "2026-08-04T18:30:00.000Z",
      "checkingDate": "2026-08-09T18:30:00.000Z",
      "date": "2026-08-09T18:30:00.000Z",
      "grn": 917,
      "billNo": "SHE/E/2627/00035",
      "supplierName": "GINZA INDUSTRIES LTD",
      "materialType": "Raw Material",
      "materialCategory": "Raw Material",
      "itemName": "HOOK-EYE 2x3 MICRO FIBER NYLON-SS 32-60MM NON BRUSHED-RELUX NUDE",
      "receivedQuantity": 12e3,
      "checkedQuantity": 3600,
      "passQuantity": 12e3,
      "rejectedQuantity": 0,
      "itemRemarks": "PASS",
      "generalRemarks": "PASS",
      "zone": "KERALA",
      "location": "KERALA",
      "inspector": "PRATHEEKSHA",
      "id": "312817e6-047c-4f52-abe6-666e8f94b1a9"
    },
    {
      "timestamp": "2026-08-10T10:33:53.971Z",
      "receivedDate": "2026-08-07T18:30:00.000Z",
      "checkingDate": "2026-08-09T18:30:00.000Z",
      "date": "2026-08-09T18:30:00.000Z",
      "grn": 956,
      "billNo": "FFA/2026-27/794",
      "supplierName": "FRESH FEEL APPARELS",
      "materialType": "Raw Material",
      "materialCategory": "Raw Material",
      "itemName": "HOOK-EYE 2x3 MICRO FIBER NYLON-SS 32-60MM NON BRUSHED-RELUX RFD",
      "receivedQuantity": 2400,
      "checkedQuantity": 720,
      "passQuantity": 2400,
      "rejectedQuantity": 0,
      "itemRemarks": "PASS",
      "generalRemarks": "PASS",
      "zone": "KERALA",
      "location": "KERALA",
      "inspector": "PRATHEEKSHA",
      "id": "3db2af74-2c11-43fa-baba-6cf52e91d972"
    },
    {
      "timestamp": "2026-08-10T10:31:50.020Z",
      "receivedDate": "2026-08-05T18:30:00.000Z",
      "checkingDate": "2026-08-07T18:30:00.000Z",
      "date": "2026-08-07T18:30:00.000Z",
      "grn": "I/R",
      "billNo": "G-0105/26-27",
      "supplierName": "BASKAR EMBROIDERY - TIRUPUR",
      "materialType": "Raw Material",
      "materialCategory": "Raw Material",
      "itemName": "HOOK-EYE 2x3 MICRO FIBER NYLON-SS 32-60MM NON BRUSHED-RELUX CORONET BLUE",
      "receivedQuantity": 3470,
      "checkedQuantity": 1041,
      "passQuantity": 3470,
      "rejectedQuantity": 0,
      "itemRemarks": "PASS",
      "generalRemarks": "PASS",
      "zone": "KERALA",
      "location": "KERALA",
      "inspector": "PRATHEEKSHA",
      "id": "0c096954-f756-43d1-b534-e5a5a6a2e211"
    },
    {
      "timestamp": "2026-08-10T10:31:50.020Z",
      "receivedDate": "2026-08-05T18:30:00.000Z",
      "checkingDate": "2026-08-07T18:30:00.000Z",
      "date": "2026-08-07T18:30:00.000Z",
      "grn": "I/R",
      "billNo": "G-0105/26-27",
      "supplierName": "BASKAR EMBROIDERY - TIRUPUR",
      "materialType": "Raw Material",
      "materialCategory": "Raw Material",
      "itemName": "HOOK-EYE 2x3 MICRO FIBER NYLON-SS 32-60MM NON BRUSHED-RELUX QUIAL",
      "receivedQuantity": 3470,
      "checkedQuantity": 1041,
      "passQuantity": 3470,
      "rejectedQuantity": 0,
      "itemRemarks": "PASS",
      "generalRemarks": "PASS",
      "zone": "KERALA",
      "location": "KERALA",
      "inspector": "PRATHEEKSHA",
      "id": "a3f6e1a3-9cbe-4540-835c-8e8b5cd2198e"
    },
    {
      "timestamp": "2026-08-10T10:31:50.020Z",
      "receivedDate": "2026-08-05T18:30:00.000Z",
      "checkingDate": "2026-08-07T18:30:00.000Z",
      "date": "2026-08-07T18:30:00.000Z",
      "grn": "I/R",
      "billNo": "G-0105/26-27",
      "supplierName": "BASKAR EMBROIDERY - TIRUPUR",
      "materialType": "Raw Material",
      "materialCategory": "Raw Material",
      "itemName": "HOOK-EYE 2x3 MICRO FIBER NYLON-SS 32-60MM NON BRUSHED-RELUX SEPLA ROSE",
      "receivedQuantity": 3470,
      "checkedQuantity": 1041,
      "passQuantity": 3470,
      "rejectedQuantity": 0,
      "itemRemarks": "PASS",
      "generalRemarks": "PASS",
      "zone": "KERALA",
      "location": "KERALA",
      "inspector": "PRATHEEKSHA",
      "id": "b75e9815-a5d3-40a3-937a-87202b6f6991"
    },
    {
      "timestamp": "2026-08-10T10:31:50.020Z",
      "receivedDate": "2026-08-05T18:30:00.000Z",
      "checkingDate": "2026-08-07T18:30:00.000Z",
      "date": "2026-08-07T18:30:00.000Z",
      "grn": "I/R",
      "billNo": "G-0105/26-27",
      "supplierName": "BASKAR EMBROIDERY - TIRUPUR",
      "materialType": "Raw Material",
      "materialCategory": "Raw Material",
      "itemName": "HOOK-EYE 2x3 MICRO FIBER NYLON-SS 32-60MM NON BRUSHED-RELUX SLATE",
      "receivedQuantity": 2300,
      "checkedQuantity": 690,
      "passQuantity": 2300,
      "rejectedQuantity": 0,
      "itemRemarks": "PASS",
      "generalRemarks": "PASS",
      "zone": "KERALA",
      "location": "KERALA",
      "inspector": "PRATHEEKSHA",
      "id": "670ff7a3-cda8-4197-8280-edf7ff320166"
    },
    {
      "timestamp": "2026-08-10T10:31:50.020Z",
      "receivedDate": "2026-08-05T18:30:00.000Z",
      "checkingDate": "2026-08-07T18:30:00.000Z",
      "date": "2026-08-07T18:30:00.000Z",
      "grn": "I/R",
      "billNo": "G-0105/26-27",
      "supplierName": "BASKAR EMBROIDERY - TIRUPUR",
      "materialType": "Raw Material",
      "materialCategory": "Raw Material",
      "itemName": "HOOK-EYE 2x3 MICRO FIBER NYLON-SS 32-60MM NON BRUSHED-RELUX ICEBERG GREEN",
      "receivedQuantity": 2300,
      "checkedQuantity": 690,
      "passQuantity": 2300,
      "rejectedQuantity": 0,
      "itemRemarks": "PASS",
      "generalRemarks": "PASS",
      "zone": "KERALA",
      "location": "KERALA",
      "inspector": "PRATHEEKSHA",
      "id": "3ea5ca55-9f34-4d6f-aaec-b647d754f493"
    },
    {
      "timestamp": "2026-08-08T10:30:43.752Z",
      "receivedDate": "2026-08-03T18:30:00.000Z",
      "checkingDate": "2026-08-07T18:30:00.000Z",
      "date": "2026-08-07T18:30:00.000Z",
      "grn": 915,
      "billNo": "U/1172",
      "supplierName": "POLYELASTIC P LTD",
      "materialType": "Raw Material",
      "materialCategory": "Raw Material",
      "itemName": "ELASTIC NARROW WOVEN ARROW 84%NYLON 16%SPANDEX 14MM WHITE",
      "receivedQuantity": 25e3,
      "checkedQuantity": 7500,
      "passQuantity": 25e3,
      "rejectedQuantity": 0,
      "itemRemarks": "PASS",
      "generalRemarks": "PASS",
      "zone": "KERALA",
      "location": "KERALA",
      "inspector": "PRATHEEKSHA",
      "id": "dc60feaa-76b1-48e6-8eb2-55b86265bdf5"
    },
    {
      "timestamp": "2026-08-08T10:30:43.752Z",
      "receivedDate": "2026-08-03T18:30:00.000Z",
      "checkingDate": "2026-08-07T18:30:00.000Z",
      "date": "2026-08-07T18:30:00.000Z",
      "grn": 915,
      "billNo": "U/1172",
      "supplierName": "POLYELASTIC P LTD",
      "materialType": "Raw Material",
      "materialCategory": "Raw Material",
      "itemName": "ELASTIC NARROW WOVEN ARROW 84%NYLON 16%SPANDEX 18MM WHITE",
      "receivedQuantity": 5e3,
      "checkedQuantity": 1500,
      "passQuantity": 5e3,
      "rejectedQuantity": 0,
      "itemRemarks": "PASS",
      "generalRemarks": "PASS",
      "zone": "KERALA",
      "location": "KERALA",
      "inspector": "PRATHEEKSHA",
      "id": "d294eeeb-19e1-4bef-b86d-f3e4767cf717"
    },
    {
      "timestamp": "2026-08-08T10:06:15.270Z",
      "receivedDate": "2026-08-03T18:30:00.000Z",
      "checkingDate": "2026-08-07T18:30:00.000Z",
      "date": "2026-08-07T18:30:00.000Z",
      "grn": 916,
      "billNo": "SHE/E/2627/0031",
      "supplierName": "GINZA INDUSTRIES LTD",
      "materialType": "Raw Material",
      "materialCategory": "Raw Material",
      "itemName": "HOOK-EYE 2x3 MICRO FIBER NYLON-SS 32-60MM NON BRUSHED-RELUX NUDE",
      "receivedQuantity": 6e3,
      "checkedQuantity": 1800,
      "passQuantity": 6e3,
      "rejectedQuantity": 0,
      "itemRemarks": "PASS",
      "generalRemarks": "PASS",
      "zone": "KERALA",
      "location": "KERALA",
      "inspector": "PRATHEEKSHA",
      "id": "d4739d14-e819-4298-a16d-8f8f346e8fd7"
    },
    {
      "timestamp": "2026-08-08T08:14:22.845Z",
      "receivedDate": "2026-08-07T18:30:00.000Z",
      "checkingDate": "2026-08-07T18:30:00.000Z",
      "date": "2026-08-07T18:30:00.000Z",
      "grn": "I/R",
      "billNo": "G-0107/26-27",
      "supplierName": "BASKAR EMBROIDERY - TIRUPUR",
      "materialType": "Raw Material",
      "materialCategory": "Raw Material",
      "itemName": "ELASTIC NARROW WOVEN FOLDING 77%NYLON 23%SPNDX 16MM ICEBERG GREEN",
      "receivedQuantity": 904,
      "checkedQuantity": 290,
      "passQuantity": 904,
      "rejectedQuantity": 0,
      "itemRemarks": "PASS",
      "generalRemarks": "PASS",
      "zone": "KERALA",
      "location": "KERALA",
      "inspector": "PRATHEEKSHA",
      "id": "e16e9289-f2a4-4581-ad46-f965a85e365a"
    },
    {
      "timestamp": "2026-08-08T08:12:51.750Z",
      "receivedDate": "2026-08-07T18:30:00.000Z",
      "checkingDate": "2026-08-07T18:30:00.000Z",
      "date": "2026-08-07T18:30:00.000Z",
      "grn": 953,
      "billNo": "KIPL2627INVO2240",
      "supplierName": "KONIKA INTIMA PRIVATE LIMITED",
      "materialType": "Raw Material",
      "materialCategory": "Raw Material",
      "itemName": "ELASTIC NARROW WOVEN 84%NYLON 16%SPANDEX 25MM BURL WOOD",
      "receivedQuantity": 200,
      "checkedQuantity": 60,
      "passQuantity": 200,
      "rejectedQuantity": 0,
      "itemRemarks": "PASS",
      "generalRemarks": "PASS",
      "zone": "KERALA",
      "location": "KERALA",
      "inspector": "PRATHEEKSHA",
      "id": "655b2cb6-830d-4bcd-b03c-6647c5189006"
    },
    {
      "timestamp": "2026-08-08T08:12:51.750Z",
      "receivedDate": "2026-08-07T18:30:00.000Z",
      "checkingDate": "2026-08-07T18:30:00.000Z",
      "date": "2026-08-07T18:30:00.000Z",
      "grn": 953,
      "billNo": "KIPL2627INVO2240",
      "supplierName": "KONIKA INTIMA PRIVATE LIMITED",
      "materialType": "Raw Material",
      "materialCategory": "Raw Material",
      "itemName": "ELASTIC NARROW WOVEN 84%NYLON 16%SPANDEX 25MM CORONET BLUE",
      "receivedQuantity": 100,
      "checkedQuantity": 30,
      "passQuantity": 100,
      "rejectedQuantity": 0,
      "itemRemarks": "PASS",
      "generalRemarks": "PASS",
      "zone": "KERALA",
      "location": "KERALA",
      "inspector": "PRATHEEKSHA",
      "id": "e9740b4d-6c26-4a5f-b367-8ca2a6271ad2"
    },
    {
      "timestamp": "2026-08-08T08:12:51.750Z",
      "receivedDate": "2026-08-07T18:30:00.000Z",
      "checkingDate": "2026-08-07T18:30:00.000Z",
      "date": "2026-08-07T18:30:00.000Z",
      "grn": 953,
      "billNo": "KIPL2627INVO2240",
      "supplierName": "KONIKA INTIMA PRIVATE LIMITED",
      "materialType": "Raw Material",
      "materialCategory": "Raw Material",
      "itemName": "ELASTIC NARROW WOVEN 84%NYLON 16%SPANDEX 25MM DEEP TAUPE",
      "receivedQuantity": 100,
      "checkedQuantity": 30,
      "passQuantity": 100,
      "rejectedQuantity": 0,
      "itemRemarks": "PASS",
      "generalRemarks": "PASS",
      "zone": "KERALA",
      "location": "KERALA",
      "inspector": "PRATHEEKSHA",
      "id": "5a9de28f-13d2-48a5-b58c-72458a41db1a"
    },
    {
      "timestamp": "2026-08-08T08:12:51.750Z",
      "receivedDate": "2026-08-07T18:30:00.000Z",
      "checkingDate": "2026-08-07T18:30:00.000Z",
      "date": "2026-08-07T18:30:00.000Z",
      "grn": 953,
      "billNo": "KIPL2627INVO2240",
      "supplierName": "KONIKA INTIMA PRIVATE LIMITED",
      "materialType": "Raw Material",
      "materialCategory": "Raw Material",
      "itemName": "ELASTIC NARROW WOVEN 84%NYLON 16%SPANDEX 25MM QUIAL",
      "receivedQuantity": 200,
      "checkedQuantity": 60,
      "passQuantity": 200,
      "rejectedQuantity": 0,
      "itemRemarks": "PASS",
      "generalRemarks": "PASS",
      "zone": "KERALA",
      "location": "KERALA",
      "inspector": "PRATHEEKSHA",
      "id": "1a6525df-f341-4704-85cd-71570c21e5d1"
    },
    {
      "timestamp": "2026-08-07T10:58:51.827Z",
      "receivedDate": "2026-08-04T18:30:00.000Z",
      "checkingDate": "2026-08-06T18:30:00.000Z",
      "date": "2026-08-06T18:30:00.000Z",
      "grn": 924,
      "billNo": 1308,
      "supplierName": "SACHINAM FABRICS PVT LTD",
      "materialType": "Raw Material",
      "materialCategory": "Raw Material",
      "itemName": "ELASTIC MICRO NARROW WOVEN BUFF 84%NYLON 16%SPNDX 14MM\xA0SLATE",
      "receivedQuantity": 9880,
      "checkedQuantity": 2964,
      "passQuantity": 9880,
      "rejectedQuantity": 0,
      "itemRemarks": "PASS",
      "generalRemarks": "PASS",
      "zone": "KERALA",
      "location": "KERALA",
      "inspector": "PRATHEEKSHA",
      "id": "4519dc51-341a-47d2-96e8-4c08ac38452c"
    },
    {
      "timestamp": "2026-08-07T10:58:51.827Z",
      "receivedDate": "2026-08-04T18:30:00.000Z",
      "checkingDate": "2026-08-06T18:30:00.000Z",
      "date": "2026-08-06T18:30:00.000Z",
      "grn": 924,
      "billNo": 1308,
      "supplierName": "SACHINAM FABRICS PVT LTD",
      "materialType": "Raw Material",
      "materialCategory": "Raw Material",
      "itemName": "ELASTIC MICRO NARROW WOVEN BUFF 84%NYLON 16%SPNDX 14MM\xA0CORONET BLUE",
      "receivedQuantity": 7e3,
      "checkedQuantity": 2100,
      "passQuantity": 7e3,
      "rejectedQuantity": 0,
      "itemRemarks": "PASS",
      "generalRemarks": "PASS",
      "zone": "KERALA",
      "location": "KERALA",
      "inspector": "PRATHEEKSHA",
      "id": "8380d533-8ae8-4ebc-936b-5ff71288f250"
    },
    {
      "timestamp": "2026-08-07T10:58:51.827Z",
      "receivedDate": "2026-08-04T18:30:00.000Z",
      "checkingDate": "2026-08-06T18:30:00.000Z",
      "date": "2026-08-06T18:30:00.000Z",
      "grn": 924,
      "billNo": 1308,
      "supplierName": "SACHINAM FABRICS PVT LTD",
      "materialType": "Raw Material",
      "materialCategory": "Raw Material",
      "itemName": "ELASTIC MICRO NARROW WOVEN BUFF 84%NYLON 16%SPNDX 14MM MAROON",
      "receivedQuantity": 9140,
      "checkedQuantity": 2742,
      "passQuantity": 9140,
      "rejectedQuantity": 0,
      "itemRemarks": "PASS",
      "generalRemarks": "PASS",
      "zone": "KERALA",
      "location": "KERALA",
      "inspector": "PRATHEEKSHA",
      "id": "ab0a61e2-34d5-4122-8143-78fcdaebe37b"
    },
    {
      "timestamp": "2026-08-07T08:47:30.679Z",
      "receivedDate": "2026-07-29T18:30:00.000Z",
      "checkingDate": "2026-08-05T18:30:00.000Z",
      "date": "2026-08-05T18:30:00.000Z",
      "grn": 882,
      "billNo": "RI/26-27/28",
      "supplierName": "RICCIES INDUSTRIES",
      "materialType": "Raw Material",
      "materialCategory": "Raw Material",
      "itemName": "BOW SATIN NYLON 6MM MAROON",
      "receivedQuantity": 1e4,
      "checkedQuantity": 3e3,
      "passQuantity": 1e4,
      "rejectedQuantity": 0,
      "itemRemarks": "PASS",
      "generalRemarks": "Pass",
      "zone": "KERALA",
      "location": "KERALA",
      "inspector": "PRATHEEKSHA",
      "id": "79f73827-ca68-4f07-aeff-94dba6b973a2"
    },
    {
      "timestamp": "2026-08-07T08:47:30.679Z",
      "receivedDate": "2026-07-29T18:30:00.000Z",
      "checkingDate": "2026-08-05T18:30:00.000Z",
      "date": "2026-08-05T18:30:00.000Z",
      "grn": 882,
      "billNo": "RI/26-27/28",
      "supplierName": "RICCIES INDUSTRIES",
      "materialType": "Raw Material",
      "materialCategory": "Raw Material",
      "itemName": "BOW SATIN NYLON 6MM MEDIEVAL BLUE",
      "receivedQuantity": 5e3,
      "checkedQuantity": 1500,
      "passQuantity": 5e3,
      "rejectedQuantity": 0,
      "itemRemarks": "PASS",
      "generalRemarks": "Pass",
      "zone": "KERALA",
      "location": "KERALA",
      "inspector": "PRATHEEKSHA",
      "id": "def5ca54-d080-4763-940d-d567c5bbe059"
    },
    {
      "timestamp": "2026-08-07T08:47:30.679Z",
      "receivedDate": "2026-07-29T18:30:00.000Z",
      "checkingDate": "2026-08-05T18:30:00.000Z",
      "date": "2026-08-05T18:30:00.000Z",
      "grn": 882,
      "billNo": "RI/26-27/28",
      "supplierName": "RICCIES INDUSTRIES",
      "materialType": "Raw Material",
      "materialCategory": "Raw Material",
      "itemName": "BOW SATIN NYLON 6MM NUDE",
      "receivedQuantity": 22500,
      "checkedQuantity": 6750,
      "passQuantity": 22500,
      "rejectedQuantity": 0,
      "itemRemarks": "PASS",
      "generalRemarks": "Pass",
      "zone": "KERALA",
      "location": "KERALA",
      "inspector": "PRATHEEKSHA",
      "id": "98569bec-6a98-4fe3-b850-d2c23ba2bcdf"
    },
    {
      "timestamp": "2026-08-07T08:47:30.679Z",
      "receivedDate": "2026-07-29T18:30:00.000Z",
      "checkingDate": "2026-08-05T18:30:00.000Z",
      "date": "2026-08-05T18:30:00.000Z",
      "grn": 882,
      "billNo": "RI/26-27/28",
      "supplierName": "RICCIES INDUSTRIES",
      "materialType": "Raw Material",
      "materialCategory": "Raw Material",
      "itemName": "BOW SATIN NYLON 6MM MAUVE",
      "receivedQuantity": 3e3,
      "checkedQuantity": 900,
      "passQuantity": 3e3,
      "rejectedQuantity": 0,
      "itemRemarks": "PASS",
      "generalRemarks": "Pass",
      "zone": "KERALA",
      "location": "KERALA",
      "inspector": "PRATHEEKSHA",
      "id": "d90fd4af-f8d6-4034-a984-3b558f865356"
    },
    {
      "timestamp": "2026-08-07T08:47:30.679Z",
      "receivedDate": "2026-07-29T18:30:00.000Z",
      "checkingDate": "2026-08-05T18:30:00.000Z",
      "date": "2026-08-05T18:30:00.000Z",
      "grn": 882,
      "billNo": "RI/26-27/28",
      "supplierName": "RICCIES INDUSTRIES",
      "materialType": "Raw Material",
      "materialCategory": "Raw Material",
      "itemName": "BOW SATIN NYLON 6MM DEEP TAUPE",
      "receivedQuantity": 1e4,
      "checkedQuantity": 3e3,
      "passQuantity": 1e4,
      "rejectedQuantity": 0,
      "itemRemarks": "PASS",
      "generalRemarks": "Pass",
      "zone": "KERALA",
      "location": "KERALA",
      "inspector": "PRATHEEKSHA",
      "id": "840dea56-64a6-4239-a4db-0944903a6373"
    },
    {
      "timestamp": "2026-08-07T08:47:30.679Z",
      "receivedDate": "2026-07-29T18:30:00.000Z",
      "checkingDate": "2026-08-05T18:30:00.000Z",
      "date": "2026-08-05T18:30:00.000Z",
      "grn": 882,
      "billNo": "RI/26-27/28",
      "supplierName": "RICCIES INDUSTRIES",
      "materialType": "Raw Material",
      "materialCategory": "Raw Material",
      "itemName": "BOW SATIN NYLON 6MM QUIAL",
      "receivedQuantity": 5e3,
      "checkedQuantity": 1500,
      "passQuantity": 5e3,
      "rejectedQuantity": 0,
      "itemRemarks": "PASS",
      "generalRemarks": "Pass",
      "zone": "KERALA",
      "location": "KERALA",
      "inspector": "PRATHEEKSHA",
      "id": "597047f2-ca56-4840-bf54-60e2b7a3a894"
    },
    {
      "timestamp": "2026-08-07T08:47:30.679Z",
      "receivedDate": "2026-07-29T18:30:00.000Z",
      "checkingDate": "2026-08-05T18:30:00.000Z",
      "date": "2026-08-05T18:30:00.000Z",
      "grn": 882,
      "billNo": "RI/26-27/28",
      "supplierName": "RICCIES INDUSTRIES",
      "materialType": "Raw Material",
      "materialCategory": "Raw Material",
      "itemName": "BOW SATIN NYLON 6MM SEPLA ROSE",
      "receivedQuantity": 5e3,
      "checkedQuantity": 1500,
      "passQuantity": 5e3,
      "rejectedQuantity": 0,
      "itemRemarks": "PASS",
      "generalRemarks": "Pass",
      "zone": "KERALA",
      "location": "KERALA",
      "inspector": "PRATHEEKSHA",
      "id": "bebde7a2-80ce-4963-b24d-744dd40803e3"
    },
    {
      "timestamp": "2026-08-07T08:47:30.679Z",
      "receivedDate": "2026-07-29T18:30:00.000Z",
      "checkingDate": "2026-08-05T18:30:00.000Z",
      "date": "2026-08-05T18:30:00.000Z",
      "grn": 882,
      "billNo": "RI/26-27/28",
      "supplierName": "RICCIES INDUSTRIES",
      "materialType": "Raw Material",
      "materialCategory": "Raw Material",
      "itemName": "BOW SATIN NYLON 6MM SLATE",
      "receivedQuantity": 4500,
      "checkedQuantity": 1400,
      "passQuantity": 4500,
      "rejectedQuantity": 0,
      "itemRemarks": "PASS",
      "generalRemarks": "Pass",
      "zone": "KERALA",
      "location": "KERALA",
      "inspector": "PRATHEEKSHA",
      "id": "ee646f16-e345-420f-b204-619e645f7303"
    },
    {
      "timestamp": "2026-08-07T08:47:30.679Z",
      "receivedDate": "2026-07-29T18:30:00.000Z",
      "checkingDate": "2026-08-05T18:30:00.000Z",
      "date": "2026-08-05T18:30:00.000Z",
      "grn": 882,
      "billNo": "RI/26-27/28",
      "supplierName": "RICCIES INDUSTRIES",
      "materialType": "Raw Material",
      "materialCategory": "Raw Material",
      "itemName": "BOW SATIN NYLON 6MM CORONET BLUE",
      "receivedQuantity": 4600,
      "checkedQuantity": 1380,
      "passQuantity": 4600,
      "rejectedQuantity": 0,
      "itemRemarks": "PASS",
      "generalRemarks": "Pass",
      "zone": "KERALA",
      "location": "KERALA",
      "inspector": "PRATHEEKSHA",
      "id": "99d3a028-6c53-4923-9759-65cdf6945065"
    },
    {
      "timestamp": "2026-08-07T08:41:16.065Z",
      "receivedDate": "2026-07-29T18:30:00.000Z",
      "checkingDate": "2026-08-06T18:30:00.000Z",
      "date": "2026-08-06T18:30:00.000Z",
      "grn": 882,
      "billNo": "RI/26-27/28",
      "supplierName": "RICCIES INDUSTRIES",
      "materialType": "Raw Material",
      "materialCategory": "Raw Material",
      "itemName": "ADJUSTER METAL COATED 10MM WHITE",
      "receivedQuantity": 25e3,
      "checkedQuantity": 7500,
      "passQuantity": 25e3,
      "rejectedQuantity": 0,
      "itemRemarks": "PASS",
      "generalRemarks": "PASS",
      "zone": "KERALA",
      "location": "KERALA",
      "inspector": "PRATHEEKSHA",
      "id": "b7e8e1b3-44ee-4757-b54f-c8842504f71f"
    },
    {
      "timestamp": "2026-08-07T08:41:16.065Z",
      "receivedDate": "2026-07-29T18:30:00.000Z",
      "checkingDate": "2026-08-06T18:30:00.000Z",
      "date": "2026-08-06T18:30:00.000Z",
      "grn": 882,
      "billNo": "RI/26-27/28",
      "supplierName": "RICCIES INDUSTRIES",
      "materialType": "Raw Material",
      "materialCategory": "Raw Material",
      "itemName": "ADJUSTER METAL COATED 10MM NUDE",
      "receivedQuantity": 1e4,
      "checkedQuantity": 3e3,
      "passQuantity": 1e4,
      "rejectedQuantity": 0,
      "itemRemarks": "PASS",
      "generalRemarks": "PASS",
      "zone": "KERALA",
      "location": "KERALA",
      "inspector": "PRATHEEKSHA",
      "id": "839e906a-44a5-436b-99d6-4bde5accf01a"
    },
    {
      "timestamp": "2026-08-07T08:41:16.065Z",
      "receivedDate": "2026-07-29T18:30:00.000Z",
      "checkingDate": "2026-08-06T18:30:00.000Z",
      "date": "2026-08-06T18:30:00.000Z",
      "grn": 882,
      "billNo": "RI/26-27/28",
      "supplierName": "RICCIES INDUSTRIES",
      "materialType": "Raw Material",
      "materialCategory": "Raw Material",
      "itemName": "RING METAL COATED 12MM WHITE",
      "receivedQuantity": 5e3,
      "checkedQuantity": 1500,
      "passQuantity": 5e3,
      "rejectedQuantity": 0,
      "itemRemarks": "PASS",
      "generalRemarks": "PASS",
      "zone": "KERALA",
      "location": "KERALA",
      "inspector": "PRATHEEKSHA",
      "id": "5146d57d-0bf1-4104-8de7-b6dedf127a96"
    },
    {
      "timestamp": "2026-08-07T08:41:16.065Z",
      "receivedDate": "2026-07-29T18:30:00.000Z",
      "checkingDate": "2026-08-06T18:30:00.000Z",
      "date": "2026-08-06T18:30:00.000Z",
      "grn": 882,
      "billNo": "RI/26-27/28",
      "supplierName": "RICCIES INDUSTRIES",
      "materialType": "Raw Material",
      "materialCategory": "Raw Material",
      "itemName": "ADJUSTER METAL COATED 12MM NUDE",
      "receivedQuantity": 1e4,
      "checkedQuantity": 3e3,
      "passQuantity": 1e4,
      "rejectedQuantity": 0,
      "itemRemarks": "PASS",
      "generalRemarks": "PASS",
      "zone": "KERALA",
      "location": "KERALA",
      "inspector": "PRATHEEKSHA",
      "id": "9c76d36a-3297-407b-9904-feec464021e5"
    },
    {
      "timestamp": "2026-08-07T08:41:16.065Z",
      "receivedDate": "2026-07-29T18:30:00.000Z",
      "checkingDate": "2026-08-06T18:30:00.000Z",
      "date": "2026-08-06T18:30:00.000Z",
      "grn": 882,
      "billNo": "RI/26-27/28",
      "supplierName": "RICCIES INDUSTRIES",
      "materialType": "Raw Material",
      "materialCategory": "Raw Material",
      "itemName": "ADJUSTER METAL COATED 12MM MEDIVIEVAL BLUE",
      "receivedQuantity": 5e3,
      "checkedQuantity": 1500,
      "passQuantity": 5e3,
      "rejectedQuantity": 0,
      "itemRemarks": "PASS",
      "generalRemarks": "PASS",
      "zone": "KERALA",
      "location": "KERALA",
      "inspector": "PRATHEEKSHA",
      "id": "1ed630a1-f6e9-47d5-bb5f-979b70ccfbd0"
    },
    {
      "timestamp": "2026-08-07T08:41:16.065Z",
      "receivedDate": "2026-07-29T18:30:00.000Z",
      "checkingDate": "2026-08-06T18:30:00.000Z",
      "date": "2026-08-06T18:30:00.000Z",
      "grn": 882,
      "billNo": "RI/26-27/28",
      "supplierName": "RICCIES INDUSTRIES",
      "materialType": "Raw Material",
      "materialCategory": "Raw Material",
      "itemName": "ADJUSTER METAL COATED 12MM BURL WOOD",
      "receivedQuantity": 5e3,
      "checkedQuantity": 1500,
      "passQuantity": 5e3,
      "rejectedQuantity": 0,
      "itemRemarks": "PASS",
      "generalRemarks": "PASS",
      "zone": "KERALA",
      "location": "KERALA",
      "inspector": "PRATHEEKSHA",
      "id": "462f27de-64d5-4d7a-bc03-11a85f3a54a2"
    },
    {
      "timestamp": "2026-08-07T08:41:16.065Z",
      "receivedDate": "2026-07-29T18:30:00.000Z",
      "checkingDate": "2026-08-06T18:30:00.000Z",
      "date": "2026-08-06T18:30:00.000Z",
      "grn": 882,
      "billNo": "RI/26-27/28",
      "supplierName": "RICCIES INDUSTRIES",
      "materialType": "Raw Material",
      "materialCategory": "Raw Material",
      "itemName": "ADJUSTER METAL COATED 12MM DEEP TAUPE",
      "receivedQuantity": 5e3,
      "checkedQuantity": 1500,
      "passQuantity": 5e3,
      "rejectedQuantity": 0,
      "itemRemarks": "PASS",
      "generalRemarks": "PASS",
      "zone": "KERALA",
      "location": "KERALA",
      "inspector": "PRATHEEKSHA",
      "id": "b8a81ed3-9785-496d-b614-0d491b901e9d"
    },
    {
      "timestamp": "2026-08-07T08:41:16.065Z",
      "receivedDate": "2026-07-29T18:30:00.000Z",
      "checkingDate": "2026-08-06T18:30:00.000Z",
      "date": "2026-08-06T18:30:00.000Z",
      "grn": 882,
      "billNo": "RI/26-27/28",
      "supplierName": "RICCIES INDUSTRIES",
      "materialType": "Raw Material",
      "materialCategory": "Raw Material",
      "itemName": "ADJUSTER METAL COATED 12MM QUIAL",
      "receivedQuantity": 5e3,
      "checkedQuantity": 1500,
      "passQuantity": 5e3,
      "rejectedQuantity": 0,
      "itemRemarks": "PASS",
      "generalRemarks": "PASS",
      "zone": "KERALA",
      "location": "KERALA",
      "inspector": "PRATHEEKSHA",
      "id": "1384d1b5-12c2-4ee4-939c-15ca3bc603aa"
    },
    {
      "timestamp": "2026-08-07T08:41:16.065Z",
      "receivedDate": "2026-07-29T18:30:00.000Z",
      "checkingDate": "2026-08-06T18:30:00.000Z",
      "date": "2026-08-06T18:30:00.000Z",
      "grn": 882,
      "billNo": "RI/26-27/28",
      "supplierName": "RICCIES INDUSTRIES",
      "materialType": "Raw Material",
      "materialCategory": "Raw Material",
      "itemName": "ADJUSTER METAL COATED 12MM SLATE",
      "receivedQuantity": 5e3,
      "checkedQuantity": 1500,
      "passQuantity": 5e3,
      "rejectedQuantity": 0,
      "itemRemarks": "PASS",
      "generalRemarks": "PASS",
      "zone": "KERALA",
      "location": "KERALA",
      "inspector": "PRATHEEKSHA",
      "id": "017ce8df-e279-44fb-afea-5726b857ed56"
    },
    {
      "timestamp": "2026-08-07T08:41:16.065Z",
      "receivedDate": "2026-07-29T18:30:00.000Z",
      "checkingDate": "2026-08-06T18:30:00.000Z",
      "date": "2026-08-06T18:30:00.000Z",
      "grn": 882,
      "billNo": "RI/26-27/28",
      "supplierName": "RICCIES INDUSTRIES",
      "materialType": "Raw Material",
      "materialCategory": "Raw Material",
      "itemName": "ADJUSTER METAL COATED 12MM CORONET BLUE",
      "receivedQuantity": 5e3,
      "checkedQuantity": 1500,
      "passQuantity": 5e3,
      "rejectedQuantity": 0,
      "itemRemarks": "PASS",
      "generalRemarks": "PASS",
      "zone": "KERALA",
      "location": "KERALA",
      "inspector": "PRATHEEKSHA",
      "id": "e7895cfd-b9bb-4236-88a9-6aa5562f78da"
    },
    {
      "timestamp": "2026-08-07T08:41:16.065Z",
      "receivedDate": "2026-07-29T18:30:00.000Z",
      "checkingDate": "2026-08-06T18:30:00.000Z",
      "date": "2026-08-06T18:30:00.000Z",
      "grn": 882,
      "billNo": "RI/26-27/28",
      "supplierName": "RICCIES INDUSTRIES",
      "materialType": "Raw Material",
      "materialCategory": "Raw Material",
      "itemName": "ADJUSTER METAL COATED 12MM SEPLA ROSE",
      "receivedQuantity": 5e3,
      "checkedQuantity": 1500,
      "passQuantity": 5e3,
      "rejectedQuantity": 0,
      "itemRemarks": "PASS",
      "generalRemarks": "PASS",
      "zone": "KERALA",
      "location": "KERALA",
      "inspector": "PRATHEEKSHA",
      "id": "c6bb753e-fbd2-40c7-a974-0ed2bafc05a4"
    },
    {
      "timestamp": "2026-08-07T08:41:16.065Z",
      "receivedDate": "2026-07-29T18:30:00.000Z",
      "checkingDate": "2026-08-06T18:30:00.000Z",
      "date": "2026-08-06T18:30:00.000Z",
      "grn": 882,
      "billNo": "RI/26-27/28",
      "supplierName": "RICCIES INDUSTRIES",
      "materialType": "Raw Material",
      "materialCategory": "Raw Material",
      "itemName": "ADJUSTER METAL COATED 12MM MAROON",
      "receivedQuantity": 5e3,
      "checkedQuantity": 1500,
      "passQuantity": 5e3,
      "rejectedQuantity": 0,
      "itemRemarks": "PASS",
      "generalRemarks": "PASS",
      "zone": "KERALA",
      "location": "KERALA",
      "inspector": "PRATHEEKSHA",
      "id": "e37adc44-42ad-4547-b9d7-4bbada3df6a9"
    },
    {
      "timestamp": "2026-08-07T08:41:16.065Z",
      "receivedDate": "2026-07-29T18:30:00.000Z",
      "checkingDate": "2026-08-06T18:30:00.000Z",
      "date": "2026-08-06T18:30:00.000Z",
      "grn": 882,
      "billNo": "RI/26-27/28",
      "supplierName": "RICCIES INDUSTRIES",
      "materialType": "Raw Material",
      "materialCategory": "Raw Material",
      "itemName": "ADJUSTER METAL COATED 14MM WHITE",
      "receivedQuantity": 125e3,
      "checkedQuantity": 37500,
      "passQuantity": 125e3,
      "rejectedQuantity": 0,
      "itemRemarks": "PASS",
      "generalRemarks": "PASS",
      "zone": "KERALA",
      "location": "KERALA",
      "inspector": "PRATHEEKSHA",
      "id": "2bb14a3e-2da9-45a4-b136-321155c47c50"
    },
    {
      "timestamp": "2026-08-07T08:41:16.065Z",
      "receivedDate": "2026-07-29T18:30:00.000Z",
      "checkingDate": "2026-08-06T18:30:00.000Z",
      "date": "2026-08-06T18:30:00.000Z",
      "grn": 882,
      "billNo": "RI/26-27/28",
      "supplierName": "RICCIES INDUSTRIES",
      "materialType": "Raw Material",
      "materialCategory": "Raw Material",
      "itemName": "RING-ADJUSTER NYLON-COATED 14MM BLACK",
      "receivedQuantity": 35e3,
      "checkedQuantity": 10500,
      "passQuantity": 35e3,
      "rejectedQuantity": 0,
      "itemRemarks": "PASS",
      "generalRemarks": "PASS",
      "zone": "KERALA",
      "location": "KERALA",
      "inspector": "PRATHEEKSHA",
      "id": "0c40c253-700b-4666-b47e-6ae76c9cf875"
    },
    {
      "timestamp": "2026-08-07T08:41:16.065Z",
      "receivedDate": "2026-07-29T18:30:00.000Z",
      "checkingDate": "2026-08-06T18:30:00.000Z",
      "date": "2026-08-06T18:30:00.000Z",
      "grn": 882,
      "billNo": "RI/26-27/28",
      "supplierName": "RICCIES INDUSTRIES",
      "materialType": "Raw Material",
      "materialCategory": "Raw Material",
      "itemName": "ADJUSTER METAL COATED 14MM MEDIEVAL BLUE",
      "receivedQuantity": 5e4,
      "checkedQuantity": 15e3,
      "passQuantity": 5e4,
      "rejectedQuantity": 0,
      "itemRemarks": "PASS",
      "generalRemarks": "PASS",
      "zone": "KERALA",
      "location": "KERALA",
      "inspector": "PRATHEEKSHA",
      "id": "b789e7aa-3088-4c86-a4f6-e358f0109bf7"
    },
    {
      "timestamp": "2026-08-07T08:41:16.065Z",
      "receivedDate": "2026-07-29T18:30:00.000Z",
      "checkingDate": "2026-08-06T18:30:00.000Z",
      "date": "2026-08-06T18:30:00.000Z",
      "grn": 882,
      "billNo": "RI/26-27/28",
      "supplierName": "RICCIES INDUSTRIES",
      "materialType": "Raw Material",
      "materialCategory": "Raw Material",
      "itemName": "ADJUSTER METAL COATED 14MM NUDE",
      "receivedQuantity": 155e3,
      "checkedQuantity": 46500,
      "passQuantity": 155e3,
      "rejectedQuantity": 0,
      "itemRemarks": "PASS",
      "generalRemarks": "PASS",
      "zone": "KERALA",
      "location": "KERALA",
      "inspector": "PRATHEEKSHA",
      "id": "fa2f12c5-0cf6-48aa-8d2a-72e85e3cda16"
    },
    {
      "timestamp": "2026-08-07T08:41:16.065Z",
      "receivedDate": "2026-07-29T18:30:00.000Z",
      "checkingDate": "2026-08-06T18:30:00.000Z",
      "date": "2026-08-06T18:30:00.000Z",
      "grn": 882,
      "billNo": "RI/26-27/28",
      "supplierName": "RICCIES INDUSTRIES",
      "materialType": "Raw Material",
      "materialCategory": "Raw Material",
      "itemName": "ADJUSTER METAL COATED 14MM MAROON",
      "receivedQuantity": 7e4,
      "checkedQuantity": 17e3,
      "passQuantity": 7e4,
      "rejectedQuantity": 0,
      "itemRemarks": "PASS",
      "generalRemarks": "PASS",
      "zone": "KERALA",
      "location": "KERALA",
      "inspector": "PRATHEEKSHA",
      "id": "9cde2f7b-b948-4211-8520-231357f633b0"
    },
    {
      "timestamp": "2026-08-07T08:41:16.065Z",
      "receivedDate": "2026-07-29T18:30:00.000Z",
      "checkingDate": "2026-08-06T18:30:00.000Z",
      "date": "2026-08-06T18:30:00.000Z",
      "grn": 882,
      "billNo": "RI/26-27/28",
      "supplierName": "RICCIES INDUSTRIES",
      "materialType": "Raw Material",
      "materialCategory": "Raw Material",
      "itemName": "ADJUSTER METAL COATED 14MM BURL WOOD",
      "receivedQuantity": 4e4,
      "checkedQuantity": 12e3,
      "passQuantity": 4e4,
      "rejectedQuantity": 0,
      "itemRemarks": "PASS",
      "generalRemarks": "PASS",
      "zone": "KERALA",
      "location": "KERALA",
      "inspector": "PRATHEEKSHA",
      "id": "93f1cb77-8829-4812-8366-5617fc840d97"
    },
    {
      "timestamp": "2026-08-07T08:41:16.065Z",
      "receivedDate": "2026-07-29T18:30:00.000Z",
      "checkingDate": "2026-08-06T18:30:00.000Z",
      "date": "2026-08-06T18:30:00.000Z",
      "grn": 882,
      "billNo": "RI/26-27/28",
      "supplierName": "RICCIES INDUSTRIES",
      "materialType": "Raw Material",
      "materialCategory": "Raw Material",
      "itemName": "ADJUSTER METAL COATED 14MM DEEP TAUPE",
      "receivedQuantity": 35e3,
      "checkedQuantity": 10500,
      "passQuantity": 35e3,
      "rejectedQuantity": 0,
      "itemRemarks": "PASS",
      "generalRemarks": "PASS",
      "zone": "KERALA",
      "location": "KERALA",
      "inspector": "PRATHEEKSHA",
      "id": "efa94bb9-70a1-4602-ba43-2dd41dd17d7d"
    },
    {
      "timestamp": "2026-08-07T08:41:16.065Z",
      "receivedDate": "2026-07-29T18:30:00.000Z",
      "checkingDate": "2026-08-06T18:30:00.000Z",
      "date": "2026-08-06T18:30:00.000Z",
      "grn": 882,
      "billNo": "RI/26-27/28",
      "supplierName": "RICCIES INDUSTRIES",
      "materialType": "Raw Material",
      "materialCategory": "Raw Material",
      "itemName": "ADJUSTER METAL COATED 14MM QUIAL",
      "receivedQuantity": 35e3,
      "checkedQuantity": 10500,
      "passQuantity": 35e3,
      "rejectedQuantity": 0,
      "itemRemarks": "PASS",
      "generalRemarks": "PASS",
      "zone": "KERALA",
      "location": "KERALA",
      "inspector": "PRATHEEKSHA",
      "id": "9dfb537a-e14a-4dd5-bb44-70167d006820"
    },
    {
      "timestamp": "2026-08-07T08:41:16.065Z",
      "receivedDate": "2026-07-29T18:30:00.000Z",
      "checkingDate": "2026-08-06T18:30:00.000Z",
      "date": "2026-08-06T18:30:00.000Z",
      "grn": 882,
      "billNo": "RI/26-27/28",
      "supplierName": "RICCIES INDUSTRIES",
      "materialType": "Raw Material",
      "materialCategory": "Raw Material",
      "itemName": "ADJUSTER METAL COATED 14MM CORONET BLUE",
      "receivedQuantity": 35e3,
      "checkedQuantity": 10500,
      "passQuantity": 35e3,
      "rejectedQuantity": 0,
      "itemRemarks": "PASS",
      "generalRemarks": "PASS",
      "zone": "KERALA",
      "location": "KERALA",
      "inspector": "PRATHEEKSHA",
      "id": "9df3af1a-3cd0-41a2-9f20-410ec729a72e"
    },
    {
      "timestamp": "2026-08-07T08:41:16.065Z",
      "receivedDate": "2026-07-29T18:30:00.000Z",
      "checkingDate": "2026-08-06T18:30:00.000Z",
      "date": "2026-08-06T18:30:00.000Z",
      "grn": 882,
      "billNo": "RI/26-27/28",
      "supplierName": "RICCIES INDUSTRIES",
      "materialType": "Raw Material",
      "materialCategory": "Raw Material",
      "itemName": "ADJUSTER METAL COATED 14MM SEPLA ROSE",
      "receivedQuantity": 45e3,
      "checkedQuantity": 13500,
      "passQuantity": 45e4,
      "rejectedQuantity": 0,
      "itemRemarks": "PASS",
      "generalRemarks": "PASS",
      "zone": "KERALA",
      "location": "KERALA",
      "inspector": "PRATHEEKSHA",
      "id": "d9db1313-d4db-457c-a296-bd8ca67630eb"
    },
    {
      "timestamp": "2026-08-07T08:41:16.065Z",
      "receivedDate": "2026-07-29T18:30:00.000Z",
      "checkingDate": "2026-08-06T18:30:00.000Z",
      "date": "2026-08-06T18:30:00.000Z",
      "grn": 882,
      "billNo": "RI/26-27/28",
      "supplierName": "RICCIES INDUSTRIES",
      "materialType": "Raw Material",
      "materialCategory": "Raw Material",
      "itemName": "ADJUSTER METAL COATED 14MM SLATE",
      "receivedQuantity": 45e3,
      "checkedQuantity": 13500,
      "passQuantity": 45e3,
      "rejectedQuantity": 0,
      "itemRemarks": "PASS",
      "generalRemarks": "PASS",
      "zone": "KERALA",
      "location": "KERALA",
      "inspector": "PRATHEEKSHA",
      "id": "b920fa2f-3d6c-4728-9771-a671f8c39086"
    },
    {
      "timestamp": "2026-08-07T08:41:16.065Z",
      "receivedDate": "2026-07-29T18:30:00.000Z",
      "checkingDate": "2026-08-06T18:30:00.000Z",
      "date": "2026-08-06T18:30:00.000Z",
      "grn": 882,
      "billNo": "RI/26-27/28",
      "supplierName": "RICCIES INDUSTRIES",
      "materialType": "Raw Material",
      "materialCategory": "Raw Material",
      "itemName": "ADJUSTER METAL COATED 14MM ICEBERG GREEN",
      "receivedQuantity": 3e4,
      "checkedQuantity": 9e3,
      "passQuantity": 3e4,
      "rejectedQuantity": 0,
      "itemRemarks": "PASS",
      "generalRemarks": "PASS",
      "zone": "KERALA",
      "location": "KERALA",
      "inspector": "PRATHEEKSHA",
      "id": "fed83dad-3a77-462f-9865-be4dabf7d550"
    },
    {
      "timestamp": "2026-08-07T08:41:16.065Z",
      "receivedDate": "2026-07-29T18:30:00.000Z",
      "checkingDate": "2026-08-06T18:30:00.000Z",
      "date": "2026-08-06T18:30:00.000Z",
      "grn": 882,
      "billNo": "RI/26-27/28",
      "supplierName": "RICCIES INDUSTRIES",
      "materialType": "Raw Material",
      "materialCategory": "Raw Material",
      "itemName": "ADJUSTER METAL COATED 14MM MAUVE",
      "receivedQuantity": 3e4,
      "checkedQuantity": 9e3,
      "passQuantity": 3e4,
      "rejectedQuantity": 0,
      "itemRemarks": "PASS",
      "generalRemarks": "PASS",
      "zone": "KERALA",
      "location": "KERALA",
      "inspector": "PRATHEEKSHA",
      "id": "f8f90cdc-2249-484a-977c-34f21debb8a0"
    },
    {
      "timestamp": "2026-08-07T08:10:57.298Z",
      "receivedDate": "2026-07-26T18:30:00.000Z",
      "checkingDate": "2026-08-06T18:30:00.000Z",
      "date": "2026-08-06T18:30:00.000Z",
      "grn": 883,
      "billNo": 550,
      "supplierName": "KAKADIYA ENTERPRISE",
      "materialType": "Raw Material",
      "materialCategory": "Raw Material",
      "itemName": "ELASTIC MICRO NARROW WOVEN BUFF 84%NYLON 16%SPNDX 14MM\xA0 QUIAL",
      "receivedQuantity": 4e3,
      "checkedQuantity": 1200,
      "passQuantity": 4e3,
      "rejectedQuantity": 0,
      "itemRemarks": "PASS",
      "generalRemarks": "pass",
      "zone": "KERALA",
      "location": "KERALA",
      "inspector": "PRATHEEKSHA",
      "id": "05bf4069-7017-4dff-b44d-d30d25599503"
    },
    {
      "timestamp": "2026-08-07T08:10:57.298Z",
      "receivedDate": "2026-07-26T18:30:00.000Z",
      "checkingDate": "2026-08-06T18:30:00.000Z",
      "date": "2026-08-06T18:30:00.000Z",
      "grn": 883,
      "billNo": 550,
      "supplierName": "KAKADIYA ENTERPRISE",
      "materialType": "Raw Material",
      "materialCategory": "Raw Material",
      "itemName": "ELASTIC MICRO NARROW WOVEN BUFF 84%NYLON 16%SPNDX 18MM QUIAL",
      "receivedQuantity": 4500,
      "checkedQuantity": 1350,
      "passQuantity": 4500,
      "rejectedQuantity": 0,
      "itemRemarks": "PASS",
      "generalRemarks": "pass",
      "zone": "KERALA",
      "location": "KERALA",
      "inspector": "PRATHEEKSHA",
      "id": "a96d8df4-4f86-42d9-81b6-8d205c6fc14c"
    },
    {
      "timestamp": "2026-08-07T08:10:57.298Z",
      "receivedDate": "2026-07-26T18:30:00.000Z",
      "checkingDate": "2026-08-06T18:30:00.000Z",
      "date": "2026-08-06T18:30:00.000Z",
      "grn": 883,
      "billNo": 550,
      "supplierName": "KAKADIYA ENTERPRISE",
      "materialType": "Raw Material",
      "materialCategory": "Raw Material",
      "itemName": "ELASTIC MICRO NARROW WOVEN BUFF 84%NYLON 16%SPNDX 12MM\xA0 QUIAL",
      "receivedQuantity": 5850,
      "checkedQuantity": 1755,
      "passQuantity": 5850,
      "rejectedQuantity": 0,
      "itemRemarks": "pass",
      "generalRemarks": "pass",
      "zone": "KERALA",
      "location": "KERALA",
      "inspector": "PRATHEEKSHA",
      "id": "cc20d41d-47b5-4da3-9952-9ee45a1ee87e"
    },
    {
      "timestamp": "2026-08-07T07:41:44.566Z",
      "receivedDate": "2026-08-03T18:30:00.000Z",
      "checkingDate": "2026-08-06T18:30:00.000Z",
      "date": "2026-08-06T18:30:00.000Z",
      "grn": 920,
      "billNo": "FFA/2026-27 /734",
      "supplierName": "FRESH FEEL APPARELS",
      "materialType": "Raw Material",
      "materialCategory": "Raw Material",
      "itemName": "HOOK-EYE 2x3 MICRO FIBER NYLON-SS 32-60MM NON BRUSHED-RELUX RFD",
      "receivedQuantity": 12e3,
      "checkedQuantity": 3600,
      "passQuantity": 12e3,
      "rejectedQuantity": 0,
      "itemRemarks": "PASS",
      "generalRemarks": "PASS",
      "zone": "KERALA",
      "location": "KERALA",
      "inspector": "PRATHEEKSHA",
      "id": "23a789d2-f818-4abf-9e77-fce482f3e16b"
    },
    {
      "timestamp": "2026-08-07T07:41:44.566Z",
      "receivedDate": "2026-08-03T18:30:00.000Z",
      "checkingDate": "2026-08-06T18:30:00.000Z",
      "date": "2026-08-06T18:30:00.000Z",
      "grn": 920,
      "billNo": "FFA/2026-27 /734",
      "supplierName": "FRESH FEEL APPARELS",
      "materialType": "Raw Material",
      "materialCategory": "Raw Material",
      "itemName": "HOOK-EYE 3x3 MICRO FIBER NYLON-SS 45-60MM NON BRUSHED-RELUX RFD",
      "receivedQuantity": 9600,
      "checkedQuantity": 2880,
      "passQuantity": 9600,
      "rejectedQuantity": 0,
      "itemRemarks": "PASS",
      "generalRemarks": "PASS",
      "zone": "KERALA",
      "location": "KERALA",
      "inspector": "PRATHEEKSHA",
      "id": "f2210925-c768-476b-a65a-eded69a5d9bc"
    },
    {
      "timestamp": "2026-08-07T07:37:14.200Z",
      "receivedDate": "2026-08-03T18:30:00.000Z",
      "checkingDate": "2026-08-06T18:30:00.000Z",
      "date": "2026-08-06T18:30:00.000Z",
      "grn": 921,
      "billNo": "FFA/2026-27 / 731",
      "supplierName": "FRESH FEEL APPARELS",
      "materialType": "Raw Material",
      "materialCategory": "Raw Material",
      "itemName": "HOOK-EYE 3x3 MICRO FIBER NYLON- 100 GSM LINING - SS 44-55MM NON BRUSHED-FEATHERLITE RFD",
      "receivedQuantity": 9600,
      "checkedQuantity": 2880,
      "passQuantity": 9600,
      "rejectedQuantity": 0,
      "itemRemarks": "PASS",
      "generalRemarks": "PASS",
      "zone": "KERALA",
      "location": "KERALA",
      "inspector": "PRATHEEKSHA",
      "id": "7916a916-e5e9-4c84-9bdc-1cf06bc93d54"
    },
    {
      "timestamp": "2026-08-06T11:17:48.981Z",
      "receivedDate": "2026-07-28T18:30:00.000Z",
      "checkingDate": "2026-08-04T18:30:00.000Z",
      "date": "2026-08-04T18:30:00.000Z",
      "grn": 857,
      "billNo": "LBF260004052",
      "supplierName": "VARDHMAN TEXTILES LIMITED",
      "materialType": "Raw Material",
      "materialCategory": "Raw Material",
      "itemName": "CLOTH WOVEN 132 EPI-72PPI 100%CTN 40S 125GSM 58INCH MAROON",
      "receivedQuantity": 2057,
      "checkedQuantity": 617.1,
      "passQuantity": 2057,
      "rejectedQuantity": 0,
      "itemRemarks": "PASS",
      "generalRemarks": "PASS",
      "zone": "KERALA",
      "location": "KERALA",
      "inspector": "PRATHEEKSHA",
      "id": "2822e49e-9403-45ca-a637-7ad19461067d"
    },
    {
      "timestamp": "2026-08-06T11:17:48.981Z",
      "receivedDate": "2026-07-28T18:30:00.000Z",
      "checkingDate": "2026-08-04T18:30:00.000Z",
      "date": "2026-08-04T18:30:00.000Z",
      "grn": 857,
      "billNo": "LBF260004052",
      "supplierName": "VARDHMAN TEXTILES LIMITED",
      "materialType": "Raw Material",
      "materialCategory": "Raw Material",
      "itemName": "CLOTH WOVEN 132 EPI-72PPI 100%CTN 40S 125GSM 58INCH NUDE",
      "receivedQuantity": 7206.5,
      "checkedQuantity": 2162,
      "passQuantity": 7206.5,
      "rejectedQuantity": 0,
      "itemRemarks": "PASS",
      "generalRemarks": "PASS",
      "zone": "KERALA",
      "location": "KERALA",
      "inspector": "PRATHEEKSHA",
      "id": "caddd79e-6ee7-4af7-9aa3-edf72a522a7c"
    },
    {
      "timestamp": "2026-08-06T11:17:48.981Z",
      "receivedDate": "2026-07-28T18:30:00.000Z",
      "checkingDate": "2026-08-04T18:30:00.000Z",
      "date": "2026-08-04T18:30:00.000Z",
      "grn": 857,
      "billNo": "LBF260004052",
      "supplierName": "VARDHMAN TEXTILES LIMITED",
      "materialType": "Raw Material",
      "materialCategory": "Raw Material",
      "itemName": "CLOTH WOVEN 132 EPI-72PPI 100%CTN 40S 125GSM 58INCH QUAIL",
      "receivedQuantity": 3919,
      "checkedQuantity": 1175.7,
      "passQuantity": 3919,
      "rejectedQuantity": 0,
      "itemRemarks": "PASS",
      "generalRemarks": "PASS",
      "zone": "KERALA",
      "location": "KERALA",
      "inspector": "PRATHEEKSHA",
      "id": "1ca48f6a-7efe-4866-b156-6c6c52b5ede3"
    },
    {
      "timestamp": "2026-08-06T11:17:48.981Z",
      "receivedDate": "2026-07-28T18:30:00.000Z",
      "checkingDate": "2026-08-04T18:30:00.000Z",
      "date": "2026-08-04T18:30:00.000Z",
      "grn": 857,
      "billNo": "LBF260004052",
      "supplierName": "VARDHMAN TEXTILES LIMITED",
      "materialType": "Raw Material",
      "materialCategory": "Raw Material",
      "itemName": "CLOTH WOVEN 132 EPI-72PPI 100%CTN 40S 125GSM 58INCH CORONET BLUE",
      "receivedQuantity": 1020,
      "checkedQuantity": 306,
      "passQuantity": 1020,
      "rejectedQuantity": 0,
      "itemRemarks": "PASS",
      "generalRemarks": "PASS",
      "zone": "KERALA",
      "location": "KERALA",
      "inspector": "PRATHEEKSHA",
      "id": "367cc577-aac8-4546-aa03-cffe0e55c986"
    },
    {
      "timestamp": "2026-08-06T11:17:48.981Z",
      "receivedDate": "2026-07-28T18:30:00.000Z",
      "checkingDate": "2026-08-04T18:30:00.000Z",
      "date": "2026-08-04T18:30:00.000Z",
      "grn": 857,
      "billNo": "LBF260004052",
      "supplierName": "VARDHMAN TEXTILES LIMITED",
      "materialType": "Raw Material",
      "materialCategory": "Raw Material",
      "itemName": "CLOTH WOVEN 132 EPI-72PPI 100%CTN 40S 125GSM 58INCH SLATE",
      "receivedQuantity": 1023,
      "checkedQuantity": 306.9,
      "passQuantity": 1023,
      "rejectedQuantity": 0,
      "itemRemarks": "PASS",
      "generalRemarks": "PASS",
      "zone": "KERALA",
      "location": "KERALA",
      "inspector": "PRATHEEKSHA",
      "id": "af64a4bb-8b91-4c15-82c4-8384977b696d"
    },
    {
      "timestamp": "2026-08-06T11:17:48.981Z",
      "receivedDate": "2026-07-28T18:30:00.000Z",
      "checkingDate": "2026-08-04T18:30:00.000Z",
      "date": "2026-08-04T18:30:00.000Z",
      "grn": 857,
      "billNo": "LBF260004052",
      "supplierName": "VARDHMAN TEXTILES LIMITED",
      "materialType": "Raw Material",
      "materialCategory": "Raw Material",
      "itemName": "CLOTH WOVEN 132 EPI-72PPI 100%CTN 40S 125GSM 58INCH\xA0BURL WOOD",
      "receivedQuantity": 1535,
      "checkedQuantity": 460.5,
      "passQuantity": 1535,
      "rejectedQuantity": 0,
      "itemRemarks": "PASS",
      "generalRemarks": "PASS",
      "zone": "KERALA",
      "location": "KERALA",
      "inspector": "PRATHEEKSHA",
      "id": "ff2ff1d0-21f6-4734-a865-c9b7fb225c00"
    },
    {
      "timestamp": "2026-08-06T10:57:33.911Z",
      "receivedDate": "2026-07-28T18:30:00.000Z",
      "checkingDate": "2026-08-04T18:30:00.000Z",
      "date": "2026-08-04T18:30:00.000Z",
      "grn": 856,
      "billNo": "LBF260003645",
      "supplierName": "VARDHMAN TEXTILES LIMITED",
      "materialType": "Raw Material",
      "materialCategory": "Raw Material",
      "itemName": "CLOTH WOVEN 132 EPI-72PPI 100%CTN 40S 125GSM 58INCH SLATE",
      "receivedQuantity": 1028,
      "checkedQuantity": 308.4,
      "passQuantity": 1028,
      "rejectedQuantity": 0,
      "itemRemarks": "PASS",
      "generalRemarks": "PASS",
      "zone": "KERALA",
      "location": "KERALA",
      "inspector": "PRATHEEKSHA",
      "id": "eac34fb0-21fa-45cd-9004-90a418284265"
    },
    {
      "timestamp": "2026-08-06T10:57:33.911Z",
      "receivedDate": "2026-07-28T18:30:00.000Z",
      "checkingDate": "2026-08-04T18:30:00.000Z",
      "date": "2026-08-04T18:30:00.000Z",
      "grn": 856,
      "billNo": "LBF260003645",
      "supplierName": "VARDHMAN TEXTILES LIMITED",
      "materialType": "Raw Material",
      "materialCategory": "Raw Material",
      "itemName": "CLOTH WOVEN 132 EPI-72PPI 100%CTN 40S 125GSM 58INCH WHITE",
      "receivedQuantity": 2059,
      "checkedQuantity": 617.7,
      "passQuantity": 2059,
      "rejectedQuantity": 0,
      "itemRemarks": "PASS",
      "generalRemarks": "PASS",
      "zone": "KERALA",
      "location": "KERALA",
      "inspector": "PRATHEEKSHA",
      "id": "841b7b1f-8e05-4b7a-9dfc-36e25ad7c82e"
    },
    {
      "timestamp": "2026-08-06T10:57:33.911Z",
      "receivedDate": "2026-07-28T18:30:00.000Z",
      "checkingDate": "2026-08-04T18:30:00.000Z",
      "date": "2026-08-04T18:30:00.000Z",
      "grn": 856,
      "billNo": "LBF260003645",
      "supplierName": "VARDHMAN TEXTILES LIMITED",
      "materialType": "Raw Material",
      "materialCategory": "Raw Material",
      "itemName": "CLOTH WOVEN 132 EPI-72PPI 100%CTN 40S 125GSM 58INCH DEEP TAUPE",
      "receivedQuantity": 2059,
      "checkedQuantity": 617.7,
      "passQuantity": 2059,
      "rejectedQuantity": 0,
      "itemRemarks": "PASS",
      "generalRemarks": "PASS",
      "zone": "KERALA",
      "location": "KERALA",
      "inspector": "PRATHEEKSHA",
      "id": "94b75820-36d1-437d-927d-2b0888f73be7"
    },
    {
      "timestamp": "2026-08-06T10:57:33.911Z",
      "receivedDate": "2026-07-28T18:30:00.000Z",
      "checkingDate": "2026-08-04T18:30:00.000Z",
      "date": "2026-08-04T18:30:00.000Z",
      "grn": 856,
      "billNo": "LBF260003645",
      "supplierName": "VARDHMAN TEXTILES LIMITED",
      "materialType": "Raw Material",
      "materialCategory": "Raw Material",
      "itemName": "CLOTH WOVEN 132 EPI-72PPI 100%CTN 40S 125GSM 58INCH CORONET BLUE",
      "receivedQuantity": 1024,
      "checkedQuantity": 307.2,
      "passQuantity": 1024,
      "rejectedQuantity": 0,
      "itemRemarks": "PASS",
      "generalRemarks": "PASS",
      "zone": "KERALA",
      "location": "KERALA",
      "inspector": "PRATHEEKSHA",
      "id": "b2ff6920-1a99-4ed5-aa06-6423c0287a7d"
    },
    {
      "timestamp": "2026-08-06T10:57:33.911Z",
      "receivedDate": "2026-07-28T18:30:00.000Z",
      "checkingDate": "2026-08-04T18:30:00.000Z",
      "date": "2026-08-04T18:30:00.000Z",
      "grn": 856,
      "billNo": "LBF260003645",
      "supplierName": "VARDHMAN TEXTILES LIMITED",
      "materialType": "Raw Material",
      "materialCategory": "Raw Material",
      "itemName": "CLOTH WOVEN 132 EPI-72PPI 100%CTN 40S 125GSM 58INCH BLACK",
      "receivedQuantity": 1030,
      "checkedQuantity": 309,
      "passQuantity": 1030,
      "rejectedQuantity": 0,
      "itemRemarks": "PASS",
      "generalRemarks": "PASS",
      "zone": "KERALA",
      "location": "KERALA",
      "inspector": "PRATHEEKSHA",
      "id": "2df61b43-6a66-406b-aa37-ad9063ff3c4a"
    },
    {
      "timestamp": "2026-08-06T10:41:44.063Z",
      "receivedDate": "2026-08-03T18:30:00.000Z",
      "checkingDate": "2026-08-05T18:30:00.000Z",
      "date": "2026-08-05T18:30:00.000Z",
      "grn": 914,
      "billNo": 1272,
      "supplierName": "SACHINAM FABRICS PVT LTD",
      "materialType": "Raw Material",
      "materialCategory": "Raw Material",
      "itemName": "ELASTIC MICRO NARROW WOVEN BUFF 84%NYLON 16%SPNDX 12MM\xA0NUDE",
      "receivedQuantity": 5e3,
      "checkedQuantity": 1500,
      "passQuantity": 5e3,
      "rejectedQuantity": 0,
      "itemRemarks": "PASS",
      "generalRemarks": "PASS",
      "zone": "KERALA",
      "location": "KERALA",
      "inspector": "PRATHEEKSHA",
      "id": "3adeab75-8bce-4ac2-b130-0f51448df46f"
    },
    {
      "timestamp": "2026-08-06T10:41:44.063Z",
      "receivedDate": "2026-08-03T18:30:00.000Z",
      "checkingDate": "2026-08-05T18:30:00.000Z",
      "date": "2026-08-05T18:30:00.000Z",
      "grn": 914,
      "billNo": 1272,
      "supplierName": "SACHINAM FABRICS PVT LTD",
      "materialType": "Raw Material",
      "materialCategory": "Raw Material",
      "itemName": "ELASTIC NARROW WOVEN BUFF 90%NYLON 10%SPNDX 10MM SN18-10 WHITE",
      "receivedQuantity": 8100,
      "checkedQuantity": 2430,
      "passQuantity": 8100,
      "rejectedQuantity": 0,
      "itemRemarks": "PASS",
      "generalRemarks": "PASS",
      "zone": "KERALA",
      "location": "KERALA",
      "inspector": "PRATHEEKSHA",
      "id": "bdaefaa3-eaf9-49ac-a056-de526f37b2af"
    },
    {
      "timestamp": "2026-08-05T09:14:30.536Z",
      "receivedDate": "2026-08-03T18:30:00.000Z",
      "checkingDate": "2026-08-04T18:30:00.000Z",
      "date": "2026-08-04T18:30:00.000Z",
      "grn": 918,
      "billNo": "JNF-245/2026-27",
      "supplierName": "JAIN NARROW FABS",
      "materialType": "Raw Material",
      "materialCategory": "Raw Material",
      "itemName": "TAPE PLSTR JULIE LACE 10MM NUDE",
      "receivedQuantity": 2400,
      "checkedQuantity": 700,
      "passQuantity": 2400,
      "rejectedQuantity": 0,
      "itemRemarks": "pass",
      "generalRemarks": "pass",
      "zone": "KERALA",
      "location": "KERALA",
      "inspector": "PRATHEEKSHA",
      "id": "46682c1c-e410-4512-abe0-9b5a8652ba1e"
    },
    {
      "timestamp": "2026-08-05T04:54:36.678Z",
      "receivedDate": "2026-08-03T18:30:00.000Z",
      "checkingDate": "2026-08-03T18:30:00.000Z",
      "date": "2026-08-03T18:30:00.000Z",
      "grn": 904,
      "billNo": "LBF260004159",
      "supplierName": "VARDHMAN TEXTILES LIMITED",
      "materialType": "Raw Material",
      "materialCategory": "Raw Material",
      "itemName": "CLOTH WOVEN 132 EPI-72PPI 100%CTN 40S 125GSM 58INCH MEDIEVAL BLUE",
      "receivedQuantity": 2646,
      "checkedQuantity": 650,
      "passQuantity": 2646,
      "rejectedQuantity": 0,
      "itemRemarks": "PASS",
      "generalRemarks": "PASS",
      "zone": "KERALA",
      "location": "KERALA",
      "inspector": "PRATHEEKSHA",
      "id": "affb424d-1ea1-41a5-967e-726c741ae8b8"
    },
    {
      "timestamp": "2026-08-03T11:07:52.488Z",
      "receivedDate": "2026-07-31T18:30:00.000Z",
      "checkingDate": "2026-08-02T18:30:00.000Z",
      "date": "2026-08-02T18:30:00.000Z",
      "grn": 900,
      "billNo": "EPGST/852/26-27",
      "supplierName": "ETHAN PACKERS PVT LTD",
      "materialType": "Packing Material",
      "materialCategory": "Packing Material",
      "itemName": "BOX TOP AND BOTTOM Large with Top Laminated& Bottom with 340 Gsm Natural Shade Craft Paper",
      "receivedQuantity": 8390,
      "checkedQuantity": 2517,
      "passQuantity": 8390,
      "rejectedQuantity": 0,
      "itemRemarks": "PASS",
      "generalRemarks": "PASS",
      "zone": "KERALA",
      "location": "KERALA",
      "inspector": "PRATHEEKSHA",
      "id": "0b7d5551-280d-42b0-b447-d1742f2db0cf"
    },
    {
      "timestamp": "2026-08-03T05:59:15.902Z",
      "receivedDate": "2026-07-31T18:30:00.000Z",
      "checkingDate": "2026-08-02T18:30:00.000Z",
      "date": "2026-08-02T18:30:00.000Z",
      "grn": "I/R",
      "billNo": "G-0101/26-27",
      "supplierName": "BASKAR EMBROIDERY - TIRUPUR",
      "materialType": "Raw Material",
      "materialCategory": "Raw Material",
      "itemName": "HOOK-EYE 2x3 MICRO FIBER NYLON-SS 32-60MM NON BRUSHED-RELUX SLATE",
      "receivedQuantity": 2300,
      "checkedQuantity": 690,
      "passQuantity": 2300,
      "rejectedQuantity": 0,
      "itemRemarks": "PASS",
      "generalRemarks": "PASS",
      "zone": "KERALA",
      "location": "KERALA",
      "inspector": "PRATHEEKSHA",
      "id": "effbedcc-42bb-4b1f-b812-405592b4e462"
    },
    {
      "timestamp": "2026-08-03T05:59:15.902Z",
      "receivedDate": "2026-07-31T18:30:00.000Z",
      "checkingDate": "2026-08-02T18:30:00.000Z",
      "date": "2026-08-02T18:30:00.000Z",
      "grn": "I/R",
      "billNo": "G-0101/26-27",
      "supplierName": "BASKAR EMBROIDERY - TIRUPUR",
      "materialType": "Raw Material",
      "materialCategory": "Raw Material",
      "itemName": "ELASTIC NARROW WOVEN FOLDING 77%NYLON 23%SPNDX 16MM NUDE",
      "receivedQuantity": 900,
      "checkedQuantity": 250,
      "passQuantity": 900,
      "rejectedQuantity": 0,
      "itemRemarks": "PASS",
      "generalRemarks": "PASS",
      "zone": "KERALA",
      "location": "KERALA",
      "inspector": "PRATHEEKSHA",
      "id": "c76358af-87b7-4f0c-a208-efafd9e20484"
    },
    {
      "timestamp": "2026-08-01T11:41:48.510Z",
      "receivedDate": "2026-07-31T18:30:00.000Z",
      "checkingDate": "2026-07-31T18:30:00.000Z",
      "date": "2026-07-31T18:30:00.000Z",
      "grn": 881,
      "billNo": "FFA/2026-27 / 745",
      "supplierName": "FRESH FEEL APPARELS",
      "materialType": "Raw Material",
      "materialCategory": "Raw Material",
      "itemName": "HOOK-EYE 2x3 MICRO FIBER NYLON-SS 32-60MM NON BRUSHED-RELUX RFD",
      "receivedQuantity": 24e3,
      "checkedQuantity": 7200,
      "passQuantity": 24e3,
      "rejectedQuantity": 0,
      "itemRemarks": "PASS",
      "generalRemarks": "PASS",
      "zone": "KERALA",
      "location": "KERALA",
      "inspector": "PRATHEEKSHA",
      "id": "a49607b2-7666-4bba-8cc9-fd0739bba2e3"
    },
    {
      "timestamp": "2026-08-01T11:32:09.342Z",
      "receivedDate": "2026-07-31T18:30:00.000Z",
      "checkingDate": "2026-07-31T18:30:00.000Z",
      "date": "2026-07-31T18:30:00.000Z",
      "grn": 858,
      "billNo": "LBF260003646",
      "supplierName": "VARDHMAN TEXTILES LIMITED",
      "materialType": "Raw Material",
      "materialCategory": "Raw Material",
      "itemName": "CLOTH WOVEN 140324 136 EPI-72 PPI\xA0 96% Cotton 4% Spandex 40*40 Spandex 135 GSM 48 INCH Width MAROON",
      "receivedQuantity": 1002,
      "checkedQuantity": 300,
      "passQuantity": 1002,
      "rejectedQuantity": 0,
      "itemRemarks": "PASS",
      "generalRemarks": "PASS",
      "zone": "KERALA",
      "location": "KERALA",
      "inspector": "PRATHEEKSHA",
      "id": "6f757e39-5262-4701-a735-965b30348cd8"
    },
    {
      "timestamp": "2026-08-01T08:44:06.355Z",
      "receivedDate": "2026-07-31T18:30:00.000Z",
      "checkingDate": "2026-07-31T18:30:00.000Z",
      "date": "2026-07-31T18:30:00.000Z",
      "grn": 886,
      "billNo": 1272,
      "supplierName": "SACHINAM FABRICS PVT LTD",
      "materialType": "Raw Material",
      "materialCategory": "Raw Material",
      "itemName": "ELASTIC MICRO NARROW WOVEN BUFF 84%NYLON 16%SPNDX 14MM\xA0 WHITE",
      "receivedQuantity": 24e3,
      "checkedQuantity": 7200,
      "passQuantity": 24e3,
      "rejectedQuantity": 0,
      "itemRemarks": "PASS",
      "generalRemarks": "PASS",
      "zone": "KERALA",
      "location": "KERALA",
      "inspector": "SONY LENIN",
      "id": "b6c3d631-b057-4ba1-b101-b70c0f15a6c6"
    },
    {
      "timestamp": "2026-08-01T08:44:06.355Z",
      "receivedDate": "2026-07-31T18:30:00.000Z",
      "checkingDate": "2026-07-31T18:30:00.000Z",
      "date": "2026-07-31T18:30:00.000Z",
      "grn": 886,
      "billNo": 1272,
      "supplierName": "SACHINAM FABRICS PVT LTD",
      "materialType": "Raw Material",
      "materialCategory": "Raw Material",
      "itemName": "ELASTIC MICRO NARROW WOVEN BUFF 84%NYLON 16%SPNDX 14MM\xA0SEPLA ROSE",
      "receivedQuantity": 17500,
      "checkedQuantity": 5250,
      "passQuantity": 17500,
      "rejectedQuantity": 0,
      "itemRemarks": "PASS",
      "generalRemarks": "PASS",
      "zone": "KERALA",
      "location": "KERALA",
      "inspector": "SONY LENIN",
      "id": "038ea771-7d80-496d-b40e-7d46185e76eb"
    },
    {
      "timestamp": "2026-08-01T08:44:06.355Z",
      "receivedDate": "2026-07-31T18:30:00.000Z",
      "checkingDate": "2026-07-31T18:30:00.000Z",
      "date": "2026-07-31T18:30:00.000Z",
      "grn": 886,
      "billNo": 1272,
      "supplierName": "SACHINAM FABRICS PVT LTD",
      "materialType": "Raw Material",
      "materialCategory": "Raw Material",
      "itemName": "ELASTIC MICRO NARROW WOVEN BUFF 84%NYLON 16%SPNDX 18MM NUDE",
      "receivedQuantity": 3830,
      "checkedQuantity": 1149,
      "passQuantity": 3830,
      "rejectedQuantity": 0,
      "itemRemarks": "PASS",
      "generalRemarks": "PASS",
      "zone": "KERALA",
      "location": "KERALA",
      "inspector": "SONY LENIN",
      "id": "7a1ad8d4-c4b3-47a6-9b17-8a1d21e8a280"
    },
    {
      "timestamp": "2026-08-01T08:44:06.355Z",
      "receivedDate": "2026-07-31T18:30:00.000Z",
      "checkingDate": "2026-07-31T18:30:00.000Z",
      "date": "2026-07-31T18:30:00.000Z",
      "grn": 886,
      "billNo": 1272,
      "supplierName": "SACHINAM FABRICS PVT LTD",
      "materialType": "Raw Material",
      "materialCategory": "Raw Material",
      "itemName": "ELASTIC NARROW WOVEN BUFF 84%NYLON 16%SPNDX 25MM WHITE",
      "receivedQuantity": 500,
      "checkedQuantity": 150,
      "passQuantity": 500,
      "rejectedQuantity": 0,
      "itemRemarks": "PASS",
      "generalRemarks": "PASS",
      "zone": "KERALA",
      "location": "KERALA",
      "inspector": "SONY LENIN",
      "id": "86281106-b7e9-4675-aa83-8ebf60c87745"
    },
    {
      "timestamp": "2026-08-01T08:44:06.355Z",
      "receivedDate": "2026-07-31T18:30:00.000Z",
      "checkingDate": "2026-07-31T18:30:00.000Z",
      "date": "2026-07-31T18:30:00.000Z",
      "grn": 886,
      "billNo": 1272,
      "supplierName": "SACHINAM FABRICS PVT LTD",
      "materialType": "Raw Material",
      "materialCategory": "Raw Material",
      "itemName": "ELASTIC MICRO NARROW WOVEN BUFF 84%NYLON 16%SPNDX 14MM\xA0NUDE",
      "receivedQuantity": 23340,
      "checkedQuantity": 7002,
      "passQuantity": 23340,
      "rejectedQuantity": 0,
      "itemRemarks": "PASS",
      "generalRemarks": "PASS",
      "zone": "KERALA",
      "location": "KERALA",
      "inspector": "SONY LENIN",
      "id": "94a36add-6408-4ab4-bb68-04cd7cc1a944"
    }
  ],
  "cutting_reports": [
    {
      "id": "test-speed-check",
      "workorderNumber": 10183,
      "bundleNo": 1,
      "cutQty": 50,
      "timestamp": "2026-09-25T10:56:41.583Z",
      "wo": 10183
    },
    {
      "zone": "KERALA",
      "location": "KERALA",
      "workorderNumber": 2201060059,
      "style": "A 6",
      "styleName": "A 6",
      "size": "30 - 34",
      "cup": "B, F",
      "quantity": 100,
      "orderQty": 100,
      "colour": "MIXED",
      "color": "MIXED",
      "id": "cut-main-6loqpe8g6j8-1790321266286",
      "status": "PRECUTTINGPASSED",
      "createdAt": "2026-09-25T07:25:11.782Z",
      "createdBy": "ATHUL KRISHNA",
      "submodule": "CUTTING",
      "wo": 2201060059,
      "checkingDate": "2026-09-24T18:30:00.000Z",
      "date": "2026-09-24T18:30:00.000Z",
      "timestamp": "2026-09-25T07:27:46.286Z",
      "inspector": "ADITHYA",
      "fabricType": "Inner Fabric",
      "relaxingTime": "",
      "cuttableWidth": "",
      "layLength": "",
      "shade": "",
      "layLengthCheck": "",
      "alignmentCheck": "",
      "plyCountCheck": "",
      "markerCheck": "",
      "ratioCheck": "",
      "checkedQty": 100,
      "pcsChecked": 100,
      "reworkQty": 1,
      "rejectedQty": 10,
      "passQty": "",
      "failQty": 0,
      "complaintPcs": 0,
      "remarks": "ok",
      "passAndHold": true,
      "bundleNo": "N/A",
      "reworkPercent": 1,
      "rejectionPercent": 10,
      "moveToInline": true
    },
    {
      "zone": "KERALA",
      "location": "KERALA",
      "workorderNumber": 2201060059,
      "style": "A 6",
      "styleName": "A 6",
      "size": "30 - 34",
      "cup": "B, F",
      "quantity": 100,
      "orderQty": 100,
      "colour": "MIXED",
      "color": "MIXED",
      "id": "cut-pre-lvn2yqjtvel-1790321237865",
      "status": "PRECUTTINGPASSANDHOLD",
      "createdAt": "2026-09-25T07:25:11.782Z",
      "createdBy": "ATHUL KRISHNA",
      "submodule": "PRECUTTING",
      "wo": 2201060059,
      "checkingDate": "2026-09-24T18:30:00.000Z",
      "date": "2026-09-24T18:30:00.000Z",
      "timestamp": "2026-09-25T07:27:17.865Z",
      "inspector": "ADITHYA",
      "fabricType": "Outer Fabric",
      "relaxingTime": "N/A",
      "cuttableWidth": 88,
      "layLength": 20,
      "shade": "a2",
      "layLengthCheck": "PASS",
      "alignmentCheck": "PASS",
      "plyCountCheck": "PASS",
      "markerCheck": "PASS",
      "ratioCheck": "PASS",
      "checkedQty": 0,
      "pcsChecked": 0,
      "reworkQty": 0,
      "rejectedQty": 0,
      "passQty": 0,
      "failQty": 0,
      "complaintPcs": 0,
      "remarks": "ok",
      "passAndHold": false,
      "bundleNo": "",
      "reworkPercent": "",
      "rejectionPercent": "",
      "moveToInline": ""
    },
    {
      "zone": "KERALA",
      "location": "KERALA",
      "workorderNumber": 2201060059,
      "style": "A 6",
      "styleName": "A 6",
      "size": "30 - 34",
      "cup": "B, F",
      "quantity": 100,
      "orderQty": 100,
      "colour": "MIXED",
      "color": "MIXED",
      "id": "cut-pre-446da5qe8ct-1790321203893",
      "status": "PRECUTTING",
      "createdAt": "2026-09-25T07:25:11.782Z",
      "createdBy": "ATHUL KRISHNA",
      "submodule": "PRECUTTING",
      "wo": 2201060059,
      "checkingDate": "2026-09-24T18:30:00.000Z",
      "date": "2026-09-24T18:30:00.000Z",
      "timestamp": "2026-09-25T07:26:43.893Z",
      "inspector": "ADITHYA",
      "fabricType": "Inner Fabric",
      "relaxingTime": 8,
      "cuttableWidth": 25,
      "layLength": 20,
      "shade": "a2",
      "layLengthCheck": "PASS",
      "alignmentCheck": "PASS",
      "plyCountCheck": "PASS",
      "markerCheck": "PASS",
      "ratioCheck": "PASS",
      "checkedQty": 0,
      "pcsChecked": 0,
      "reworkQty": 0,
      "rejectedQty": 0,
      "passQty": 0,
      "failQty": 0,
      "complaintPcs": 0,
      "remarks": "N/A",
      "passAndHold": true,
      "bundleNo": "",
      "reworkPercent": "",
      "rejectionPercent": "",
      "moveToInline": ""
    },
    {
      "zone": "KERALA",
      "location": "KERALA",
      "workorderNumber": 20079,
      "style": "SAREE BRA",
      "styleName": "SAREE BRA",
      "size": "30 - 42",
      "cup": "B",
      "quantity": 5100,
      "orderQty": 5100,
      "colour": "MIXED",
      "color": "MIXED",
      "id": "cut-pre-bi4wbo0m8u-1788952020822",
      "status": "PRECUTTING",
      "createdAt": "2026-09-09T10:03:19.706Z",
      "createdBy": "ATHUL KRISHNA",
      "submodule": "PRECUTTING",
      "wo": 20079,
      "checkingDate": "2026-09-08T18:30:00.000Z",
      "date": "2026-09-08T18:30:00.000Z",
      "timestamp": "2026-09-09T11:07:00.822Z",
      "inspector": "SARI SATHYAN",
      "fabricType": "Outer Fabric",
      "relaxingTime": "N/A",
      "cuttableWidth": "145cm",
      "layLength": 3.17,
      "shade": "B1,a1,d2",
      "layLengthCheck": "PASS",
      "alignmentCheck": "PASS",
      "plyCountCheck": "PASS",
      "markerCheck": "PASS",
      "ratioCheck": "PASS",
      "checkedQty": 0,
      "pcsChecked": 0,
      "reworkQty": 0,
      "rejectedQty": 0,
      "passQty": 0,
      "failQty": 0,
      "complaintPcs": 0,
      "remarks": "N/A",
      "passAndHold": true,
      "bundleNo": "",
      "reworkPercent": "",
      "rejectionPercent": "",
      "moveToInline": ""
    },
    {
      "zone": "KERALA",
      "location": "KERALA",
      "workorderNumber": 30049,
      "style": "PRIYA SAJINI",
      "styleName": "PRIYA SAJINI",
      "size": "32 - 42",
      "cup": "B",
      "quantity": 1300,
      "orderQty": 1300,
      "colour": "BLACK",
      "color": "BLACK",
      "id": "cut-pre-bn73kohsg6-1788853023805",
      "status": "PRECUTTING",
      "createdAt": "2026-09-08T05:28:27.717Z",
      "createdBy": "ATHUL KRISHNA",
      "submodule": "PRECUTTING",
      "wo": 30049,
      "checkingDate": "2026-09-07T18:30:00.000Z",
      "date": "2026-09-07T18:30:00.000Z",
      "timestamp": "2026-09-08T07:37:03.809Z",
      "inspector": "SARI SATHYAN",
      "fabricType": "Outer Fabric",
      "relaxingTime": "N/A",
      "cuttableWidth": "146cm",
      "layLength": "2.66m",
      "shade": "G1",
      "layLengthCheck": "PASS",
      "alignmentCheck": "PASS",
      "plyCountCheck": "PASS",
      "markerCheck": "PASS",
      "ratioCheck": "PASS",
      "checkedQty": 0,
      "pcsChecked": 0,
      "reworkQty": 0,
      "rejectedQty": 0,
      "passQty": 0,
      "failQty": 0,
      "complaintPcs": 0,
      "remarks": "N/A",
      "passAndHold": false,
      "bundleNo": "",
      "reworkPercent": "",
      "rejectionPercent": "",
      "moveToInline": ""
    },
    {
      "zone": "KERALA",
      "location": "KERALA",
      "workorderNumber": 20074,
      "style": "SAREE BRA",
      "styleName": "SAREE BRA",
      "size": "32 - 42",
      "cup": "B, C",
      "quantity": 3e3,
      "orderQty": 3e3,
      "colour": "NUDE",
      "color": "NUDE",
      "id": "cut-pre-tiyebd65uem-1788852683018",
      "status": "PRECUTTING_PASS_AND_HOLD",
      "createdAt": "2026-09-08T05:23:22.911Z",
      "createdBy": "ATHUL KRISHNA",
      "submodule": "PRECUTTING",
      "wo": 20074,
      "checkingDate": "2026-09-07T18:30:00.000Z",
      "date": "2026-09-07T18:30:00.000Z",
      "timestamp": "2026-09-08T07:31:23.018Z",
      "inspector": "SARI SATHYAN",
      "fabricType": "Inner Fabric",
      "relaxingTime": "24hours",
      "cuttableWidth": "89cm",
      "layLength": "3.21m",
      "shade": 3,
      "layLengthCheck": "PASS",
      "alignmentCheck": "PASS",
      "plyCountCheck": "PASS",
      "markerCheck": "PASS",
      "ratioCheck": "PASS",
      "checkedQty": 0,
      "pcsChecked": 0,
      "reworkQty": 0,
      "rejectedQty": 0,
      "passQty": 0,
      "failQty": 0,
      "complaintPcs": 0,
      "remarks": "N/A",
      "passAndHold": true,
      "bundleNo": "",
      "reworkPercent": "",
      "rejectionPercent": "",
      "moveToInline": ""
    },
    {
      "zone": "KERALA",
      "location": "KERALA",
      "workorderNumber": 20074,
      "style": "SAREE BRA",
      "styleName": "SAREE BRA",
      "size": "32 - 42",
      "cup": "B, C",
      "quantity": 3e3,
      "orderQty": 3e3,
      "colour": "NUDE",
      "color": "NUDE",
      "id": "cut-pre-t0hhm8wewpn-1788852470547",
      "status": "PRECUTTING",
      "createdAt": "2026-09-08T05:23:22.911Z",
      "createdBy": "ATHUL KRISHNA",
      "submodule": "PRECUTTING",
      "wo": 20074,
      "checkingDate": "2026-09-07T18:30:00.000Z",
      "date": "2026-09-07T18:30:00.000Z",
      "timestamp": "2026-09-08T07:27:50.547Z",
      "inspector": "SARI SATHYAN",
      "fabricType": "Outer Fabric",
      "relaxingTime": "N/A",
      "cuttableWidth": "145cm",
      "layLength": "3.94m",
      "shade": "B1",
      "layLengthCheck": "PASS",
      "alignmentCheck": "PASS",
      "plyCountCheck": "PASS",
      "markerCheck": "PASS",
      "ratioCheck": "PASS",
      "checkedQty": 0,
      "pcsChecked": 0,
      "reworkQty": 0,
      "rejectedQty": 0,
      "passQty": 0,
      "failQty": 0,
      "complaintPcs": 0,
      "remarks": "N/A",
      "passAndHold": true,
      "bundleNo": "",
      "reworkPercent": "",
      "rejectionPercent": "",
      "moveToInline": ""
    },
    {
      "zone": "KERALA",
      "location": "KERALA",
      "workorderNumber": 30047,
      "style": "PRIYA SAJINI",
      "styleName": "PRIYA SAJINI",
      "size": "34 - 42",
      "cup": "D",
      "quantity": 3300,
      "orderQty": 3300,
      "colour": "MIXED",
      "color": "MIXED",
      "id": "cut-main-lu01ejeq4od-1788601337634",
      "status": "CUTTING",
      "createdAt": "2026-09-03T03:37:45.703Z",
      "createdBy": "ATHUL KRISHNA",
      "submodule": "CUTTING",
      "wo": 30047,
      "checkingDate": "2026-09-04T18:30:00.000Z",
      "date": "2026-09-04T18:30:00.000Z",
      "timestamp": "2026-09-05T09:42:17.634Z",
      "inspector": "SARI SATHYAN",
      "fabricType": "Outer Fabric",
      "relaxingTime": "",
      "cuttableWidth": "",
      "layLength": "",
      "shade": "",
      "layLengthCheck": "",
      "alignmentCheck": "",
      "plyCountCheck": "",
      "markerCheck": "",
      "ratioCheck": "",
      "checkedQty": 990,
      "pcsChecked": 990,
      "reworkQty": 6,
      "rejectedQty": 0,
      "passQty": "",
      "failQty": 0,
      "complaintPcs": 0,
      "remarks": "",
      "passAndHold": false,
      "bundleNo": "N/A",
      "reworkPercent": 0.61,
      "rejectionPercent": 0,
      "moveToInline": true
    },
    {
      "zone": "KERALA",
      "location": "KERALA",
      "workorderNumber": 10175,
      "style": "PRIYA SAJINI",
      "styleName": "PRIYA SAJINI",
      "size": "32 - 42",
      "cup": "B",
      "quantity": 6100,
      "orderQty": 6100,
      "colour": "MIXED",
      "color": "MIXED",
      "id": "cut-main-qfnpjuz69rm-1788601093690",
      "status": "CUTTING",
      "createdAt": "2026-09-03T04:16:41.597Z",
      "createdBy": "ATHUL KRISHNA",
      "submodule": "CUTTING",
      "wo": 10175,
      "checkingDate": "2026-09-04T18:30:00.000Z",
      "date": "2026-09-04T18:30:00.000Z",
      "timestamp": "2026-09-05T09:38:13.690Z",
      "inspector": "SARI SATHYAN",
      "fabricType": "Outer Fabric",
      "relaxingTime": "",
      "cuttableWidth": "",
      "layLength": "",
      "shade": "",
      "layLengthCheck": "",
      "alignmentCheck": "",
      "plyCountCheck": "",
      "markerCheck": "",
      "ratioCheck": "",
      "checkedQty": 3660,
      "pcsChecked": 3660,
      "reworkQty": 5,
      "rejectedQty": 0,
      "passQty": "",
      "failQty": 0,
      "complaintPcs": 0,
      "remarks": "",
      "passAndHold": false,
      "bundleNo": "N/A",
      "reworkPercent": 0.14,
      "rejectionPercent": 0,
      "moveToInline": true
    },
    {
      "zone": "KERALA",
      "location": "KERALA",
      "workorderNumber": 10179,
      "style": "JASMINE",
      "styleName": "JASMINE",
      "size": "32 - 42",
      "cup": "B",
      "quantity": 1900,
      "orderQty": 1900,
      "colour": "NUDE",
      "color": "NUDE",
      "id": "cut-pre-u3oxej8dn2n-1788600835544",
      "status": "PRECUTTING",
      "createdAt": "2026-09-05T07:42:35.138Z",
      "createdBy": "ATHUL KRISHNA",
      "submodule": "PRECUTTING",
      "wo": 10179,
      "checkingDate": "2026-09-04T18:30:00.000Z",
      "date": "2026-09-04T18:30:00.000Z",
      "timestamp": "2026-09-05T09:33:55.544Z",
      "inspector": "SARI SATHYAN",
      "fabricType": "Outer Fabric",
      "relaxingTime": "N/A",
      "cuttableWidth": "145cm",
      "layLength": "2.04m",
      "shade": "B1",
      "layLengthCheck": "PASS",
      "alignmentCheck": "PASS",
      "plyCountCheck": "PASS",
      "markerCheck": "FAIL",
      "ratioCheck": "PASS",
      "checkedQty": 0,
      "pcsChecked": 0,
      "reworkQty": 0,
      "rejectedQty": 0,
      "passQty": 0,
      "failQty": 0,
      "complaintPcs": 0,
      "remarks": "N/A",
      "passAndHold": false,
      "bundleNo": "",
      "reworkPercent": "",
      "rejectionPercent": "",
      "moveToInline": ""
    },
    {
      "zone": "KERALA",
      "location": "KERALA",
      "workorderNumber": 20071,
      "style": "PLUS SIZE",
      "styleName": "PLUS SIZE",
      "size": "32 - 42",
      "cup": "C",
      "quantity": 1260,
      "orderQty": 1260,
      "colour": "MIXED",
      "color": "MIXED",
      "id": "cut-pre-7u6sk1slv3h-1788600548242",
      "status": "PRECUTTING_PASS_AND_HOLD",
      "createdAt": "2026-09-05T03:59:47.613Z",
      "createdBy": "ATHUL KRISHNA",
      "submodule": "PRECUTTING",
      "wo": 20071,
      "checkingDate": "2026-09-04T18:30:00.000Z",
      "date": "2026-09-04T18:30:00.000Z",
      "timestamp": "2026-09-05T09:29:08.242Z",
      "inspector": "SARI SATHYAN",
      "fabricType": "Outer Fabric",
      "relaxingTime": "N/A",
      "cuttableWidth": "145cm",
      "layLength": "2.49m",
      "shade": "C2,z1,b2,c1,c2,af1c1",
      "layLengthCheck": "PASS",
      "alignmentCheck": "PASS",
      "plyCountCheck": "PASS",
      "markerCheck": "PASS",
      "ratioCheck": "PASS",
      "checkedQty": 0,
      "pcsChecked": 0,
      "reworkQty": 0,
      "rejectedQty": 0,
      "passQty": 0,
      "failQty": 0,
      "complaintPcs": 0,
      "remarks": "N/A",
      "passAndHold": false,
      "bundleNo": "",
      "reworkPercent": "",
      "rejectionPercent": "",
      "moveToInline": ""
    },
    {
      "zone": "KERALA",
      "location": "KERALA",
      "workorderNumber": 30048,
      "style": "AUTHENTIC BRA",
      "styleName": "AUTHENTIC BRA",
      "size": "32 - 42",
      "cup": "B",
      "quantity": 2600,
      "orderQty": 2600,
      "colour": "MIXED",
      "color": "MIXED",
      "id": "cut-pre-w55tycqyl9m-1788600331335",
      "status": "PRECUTTING",
      "createdAt": "2026-09-05T07:43:47.147Z",
      "createdBy": "ATHUL KRISHNA",
      "submodule": "PRECUTTING",
      "wo": 30048,
      "checkingDate": "2026-09-04T18:30:00.000Z",
      "date": "2026-09-04T18:30:00.000Z",
      "timestamp": "2026-09-05T09:25:31.335Z",
      "inspector": "SARI SATHYAN",
      "fabricType": "Outer Fabric",
      "relaxingTime": "N/A",
      "cuttableWidth": "145cm",
      "layLength": "2.78m",
      "shade": "G1,z2,b2,c2,c2",
      "layLengthCheck": "PASS",
      "alignmentCheck": "PASS",
      "plyCountCheck": "PASS",
      "markerCheck": "PASS",
      "ratioCheck": "PASS",
      "checkedQty": 0,
      "pcsChecked": 0,
      "reworkQty": 0,
      "rejectedQty": 0,
      "passQty": 0,
      "failQty": 0,
      "complaintPcs": 0,
      "remarks": "N/A",
      "passAndHold": false,
      "bundleNo": "",
      "reworkPercent": "",
      "rejectionPercent": "",
      "moveToInline": ""
    },
    {
      "zone": "KERALA",
      "location": "KERALA",
      "workorderNumber": 30050,
      "style": "PRIYA SAJINI",
      "styleName": "PRIYA SAJINI",
      "size": "32 - 44",
      "cup": "C",
      "quantity": 2400,
      "orderQty": 2400,
      "colour": "NUDE",
      "color": "NUDE",
      "id": "cut-pre-q0s8pzgb4e-1788599839489",
      "status": "PRECUTTING",
      "createdAt": "2026-09-05T07:38:47.395Z",
      "createdBy": "ATHUL KRISHNA",
      "submodule": "PRECUTTING",
      "wo": 30050,
      "checkingDate": "2026-09-04T18:30:00.000Z",
      "date": "2026-09-04T18:30:00.000Z",
      "timestamp": "2026-09-05T09:17:19.489Z",
      "inspector": "SARI SATHYAN",
      "fabricType": "Outer Fabric",
      "relaxingTime": "N/A",
      "cuttableWidth": "145cm",
      "layLength": "2.69m",
      "shade": "B1",
      "layLengthCheck": "PASS",
      "alignmentCheck": "PASS",
      "plyCountCheck": "PASS",
      "markerCheck": "PASS",
      "ratioCheck": "PASS",
      "checkedQty": 0,
      "pcsChecked": 0,
      "reworkQty": 0,
      "rejectedQty": 0,
      "passQty": 0,
      "failQty": 0,
      "complaintPcs": 0,
      "remarks": "N/A",
      "passAndHold": false,
      "bundleNo": "",
      "reworkPercent": "",
      "rejectionPercent": "",
      "moveToInline": ""
    },
    {
      "zone": "KERALA",
      "location": "KERALA",
      "workorderNumber": 20071,
      "style": "PLUS SIZE",
      "styleName": "PLUS SIZE",
      "size": "32 - 42",
      "cup": "C",
      "quantity": 1260,
      "orderQty": 1260,
      "colour": "MIXED",
      "color": "MIXED",
      "id": "cut-pre-tfs990b5qzf-1788583924364",
      "status": "PRECUTTING",
      "createdAt": "2026-09-05T03:59:47.613Z",
      "createdBy": "ATHUL KRISHNA",
      "submodule": "PRECUTTING",
      "wo": 20071,
      "checkingDate": "2026-09-04T18:30:00.000Z",
      "date": "2026-09-04T18:30:00.000Z",
      "timestamp": "2026-09-05T04:52:04.364Z",
      "inspector": "SARI SATHYAN",
      "fabricType": "Outer Fabric",
      "relaxingTime": "N/A",
      "cuttableWidth": "145 cm",
      "layLength": "2.49m",
      "shade": "B1,af2,c2,z2,g2",
      "layLengthCheck": "PASS",
      "alignmentCheck": "PASS",
      "plyCountCheck": "PASS",
      "markerCheck": "PASS",
      "ratioCheck": "PASS",
      "checkedQty": 0,
      "pcsChecked": 0,
      "reworkQty": 0,
      "rejectedQty": 0,
      "passQty": 0,
      "failQty": 0,
      "complaintPcs": 0,
      "remarks": "N/A",
      "passAndHold": true,
      "bundleNo": "",
      "reworkPercent": "",
      "rejectionPercent": "",
      "moveToInline": ""
    },
    {
      "zone": "KERALA",
      "location": "KERALA",
      "workorderNumber": "wo-1788409001597-67pni",
      "style": "PRIYA SAJINI",
      "styleName": "PRIYA SAJINI",
      "size": "32 - 42",
      "cup": "B",
      "quantity": 6100,
      "orderQty": 6100,
      "colour": "MIXED",
      "color": "MIXED",
      "id": "cut-main-p3os8anu1j-1788410744609",
      "status": "CUTTING",
      "createdAt": "2026-09-03T04:16:41.597Z",
      "createdBy": "ATHUL KRISHNA",
      "submodule": "CUTTING",
      "wo": "wo-1788409001597-67pni",
      "checkingDate": "2026-09-02T18:30:00.000Z",
      "date": "2026-09-02T18:30:00.000Z",
      "timestamp": "2026-09-03T04:45:44.609Z",
      "inspector": "SARI SATHYAN",
      "fabricType": "Outer Fabric",
      "relaxingTime": "",
      "cuttableWidth": "",
      "layLength": "",
      "shade": "",
      "layLengthCheck": "",
      "alignmentCheck": "",
      "plyCountCheck": "",
      "markerCheck": "",
      "ratioCheck": "",
      "checkedQty": 3e3,
      "pcsChecked": 3e3,
      "reworkQty": 10,
      "rejectedQty": 2,
      "passQty": "",
      "failQty": 0,
      "complaintPcs": 0,
      "remarks": "Ok",
      "passAndHold": false,
      "bundleNo": "N/A",
      "reworkPercent": 0.33,
      "rejectionPercent": 0.07,
      "moveToInline": true
    },
    {
      "zone": "KERALA",
      "location": "KERALA",
      "workorderNumber": "wo-1788409001597-67pni",
      "style": "PRIYA SAJINI",
      "styleName": "PRIYA SAJINI",
      "size": "32 - 42",
      "cup": "B",
      "quantity": 6100,
      "orderQty": 6100,
      "colour": "MIXED",
      "color": "MIXED",
      "id": "cut-pre-zs2yizirhxg-1788410704689",
      "status": "CUTTING",
      "createdAt": "2026-09-03T04:16:41.597Z",
      "createdBy": "ATHUL KRISHNA",
      "submodule": "PRECUTTING",
      "wo": "wo-1788409001597-67pni",
      "checkingDate": "2026-09-02T18:30:00.000Z",
      "date": "2026-09-02T18:30:00.000Z",
      "timestamp": "2026-09-03T04:45:04.689Z",
      "inspector": "SARI SATHYAN",
      "fabricType": "Outer Fabric",
      "relaxingTime": "N/A",
      "cuttableWidth": "145cm",
      "layLength": "3.68mtr",
      "shade": "A1,v1",
      "layLengthCheck": "PASS",
      "alignmentCheck": "PASS",
      "plyCountCheck": "PASS",
      "markerCheck": "PASS",
      "ratioCheck": "PASS",
      "checkedQty": 0,
      "pcsChecked": 0,
      "reworkQty": 0,
      "rejectedQty": 0,
      "passQty": 0,
      "failQty": 0,
      "complaintPcs": 0,
      "remarks": "N/A",
      "passAndHold": false,
      "bundleNo": "",
      "reworkPercent": "",
      "rejectionPercent": "",
      "moveToInline": ""
    },
    {
      "zone": "KERALA",
      "location": "KERALA",
      "workorderNumber": "wo-1788406665703-snpob",
      "style": "PRIYA SAJINI",
      "styleName": "PRIYA SAJINI",
      "size": "34 - 42",
      "cup": "D",
      "quantity": 3300,
      "orderQty": 3300,
      "colour": "MIXED",
      "color": "MIXED",
      "id": "cut-pre-n8lxf8kantr-1788410561278",
      "status": "CUTTING",
      "createdAt": "2026-09-03T03:37:45.703Z",
      "createdBy": "ATHUL KRISHNA",
      "submodule": "PRECUTTING",
      "wo": "wo-1788406665703-snpob",
      "checkingDate": "2026-09-02T18:30:00.000Z",
      "date": "2026-09-02T18:30:00.000Z",
      "timestamp": "2026-09-03T04:42:41.278Z",
      "inspector": "SARI SATHYAN",
      "fabricType": "Outer Fabric",
      "relaxingTime": "N/A",
      "cuttableWidth": "145cm",
      "layLength": "3.91m",
      "shade": "D2,af2,z2,c1,c2",
      "layLengthCheck": "PASS",
      "alignmentCheck": "PASS",
      "plyCountCheck": "PASS",
      "markerCheck": "PASS",
      "ratioCheck": "PASS",
      "checkedQty": 0,
      "pcsChecked": 0,
      "reworkQty": 0,
      "rejectedQty": 0,
      "passQty": 0,
      "failQty": 0,
      "complaintPcs": 0,
      "remarks": "Ok",
      "passAndHold": false,
      "bundleNo": "",
      "reworkPercent": "",
      "rejectionPercent": "",
      "moveToInline": ""
    },
    {
      "zone": "KERALA",
      "location": "KERALA",
      "workorderNumber": "wo-1788409001597-67pni",
      "style": "PRIYA SAJINI",
      "styleName": "PRIYA SAJINI",
      "size": "32 - 42",
      "cup": "B",
      "quantity": 6100,
      "orderQty": 6100,
      "colour": "MIXED",
      "color": "MIXED",
      "id": "cut-main-4nnjjxq16ip-1788410407590",
      "status": "CUTTING",
      "createdAt": "2026-09-03T04:16:41.597Z",
      "createdBy": "ATHUL KRISHNA",
      "submodule": "CUTTING",
      "wo": "wo-1788409001597-67pni",
      "checkingDate": "2026-09-02T18:30:00.000Z",
      "date": "2026-09-02T18:30:00.000Z",
      "timestamp": "2026-09-03T04:40:07.590Z",
      "inspector": "SARI SATHYAN",
      "fabricType": "Outer Fabric",
      "relaxingTime": "",
      "cuttableWidth": "",
      "layLength": "",
      "shade": "",
      "layLengthCheck": "",
      "alignmentCheck": "",
      "plyCountCheck": "",
      "markerCheck": "",
      "ratioCheck": "",
      "checkedQty": 3e3,
      "pcsChecked": 3e3,
      "reworkQty": 5,
      "rejectedQty": 3,
      "passQty": "",
      "failQty": 0,
      "complaintPcs": 0,
      "remarks": "Ok",
      "passAndHold": false,
      "bundleNo": "N/A",
      "reworkPercent": 0.17,
      "rejectionPercent": 0.1,
      "moveToInline": true
    },
    {
      "zone": "KERALA",
      "location": "KERALA",
      "workorderNumber": "wo-1788409001597-67pni",
      "style": "PRIYA SAJINI",
      "styleName": "PRIYA SAJINI",
      "size": "32 - 42",
      "cup": "B",
      "quantity": 6100,
      "orderQty": 6100,
      "colour": "MIXED",
      "color": "MIXED",
      "id": "cut-pre-z2aotyy6vo-1788410327460",
      "status": "CUTTING",
      "createdAt": "2026-09-03T04:16:41.597Z",
      "createdBy": "ATHUL KRISHNA",
      "submodule": "PRECUTTING",
      "wo": "wo-1788409001597-67pni",
      "checkingDate": "2026-09-02T18:30:00.000Z",
      "date": "2026-09-02T18:30:00.000Z",
      "timestamp": "2026-09-03T04:38:47.460Z",
      "inspector": "SARI SATHYAN",
      "fabricType": "Outer Fabric",
      "relaxingTime": "N/A",
      "cuttableWidth": "145cm",
      "layLength": "3.67m",
      "shade": "Af,g2,z2,c2,c1",
      "layLengthCheck": "PASS",
      "alignmentCheck": "PASS",
      "plyCountCheck": "PASS",
      "markerCheck": "PASS",
      "ratioCheck": "PASS",
      "checkedQty": 0,
      "pcsChecked": 0,
      "reworkQty": 0,
      "rejectedQty": 0,
      "passQty": 0,
      "failQty": 0,
      "complaintPcs": 0,
      "remarks": "Ok",
      "passAndHold": false,
      "bundleNo": "",
      "reworkPercent": "",
      "rejectionPercent": "",
      "moveToInline": ""
    },
    {
      "zone": "KERALA",
      "location": "KERALA",
      "workorderNumber": "wo-1788409832605-krlti",
      "style": "PRIYA SAJINI",
      "styleName": "PRIYA SAJINI",
      "size": "34 - 44",
      "cup": "C",
      "quantity": 3e3,
      "orderQty": 3e3,
      "colour": "MIXED",
      "color": "MIXED",
      "id": "cut-main-ghdmnjat81-1788410171363",
      "status": "CUTTING",
      "createdAt": "2026-09-03T04:30:32.605Z",
      "createdBy": "ATHUL KRISHNA",
      "submodule": "CUTTING",
      "wo": "wo-1788409832605-krlti",
      "checkingDate": "2026-09-02T18:30:00.000Z",
      "date": "2026-09-02T18:30:00.000Z",
      "timestamp": "2026-09-03T04:36:11.363Z",
      "inspector": "SARI SATHYAN",
      "fabricType": "Outer Fabric",
      "relaxingTime": "",
      "cuttableWidth": "",
      "layLength": "",
      "shade": "",
      "layLengthCheck": "",
      "alignmentCheck": "",
      "plyCountCheck": "",
      "markerCheck": "",
      "ratioCheck": "",
      "checkedQty": 100,
      "pcsChecked": 100,
      "reworkQty": 1,
      "rejectedQty": 1,
      "passQty": "",
      "failQty": 0,
      "complaintPcs": 0,
      "remarks": "Ok",
      "passAndHold": false,
      "bundleNo": "N/A",
      "reworkPercent": 1,
      "rejectionPercent": 1,
      "moveToInline": true
    },
    {
      "zone": "KERALA",
      "location": "KERALA",
      "workorderNumber": "wo-1788409832605-krlti",
      "style": "PRIYA SAJINI",
      "styleName": "PRIYA SAJINI",
      "size": "34 - 44",
      "cup": "C",
      "quantity": 3e3,
      "orderQty": 3e3,
      "colour": "MIXED",
      "color": "MIXED",
      "id": "cut-main-yjxjq2xdfp-1788410131971",
      "status": "CUTTING",
      "createdAt": "2026-09-03T04:30:32.605Z",
      "createdBy": "ATHUL KRISHNA",
      "submodule": "CUTTING",
      "wo": "wo-1788409832605-krlti",
      "checkingDate": "2026-09-02T18:30:00.000Z",
      "date": "2026-09-02T18:30:00.000Z",
      "timestamp": "2026-09-03T04:35:31.971Z",
      "inspector": "SARI SATHYAN",
      "fabricType": "Inner Fabric",
      "relaxingTime": "",
      "cuttableWidth": "",
      "layLength": "",
      "shade": "",
      "layLengthCheck": "",
      "alignmentCheck": "",
      "plyCountCheck": "",
      "markerCheck": "",
      "ratioCheck": "",
      "checkedQty": 100,
      "pcsChecked": 100,
      "reworkQty": 1,
      "rejectedQty": 1,
      "passQty": "",
      "failQty": 0,
      "complaintPcs": 0,
      "remarks": "",
      "passAndHold": true,
      "bundleNo": "N/A",
      "reworkPercent": 1,
      "rejectionPercent": 1,
      "moveToInline": true
    },
    {
      "zone": "KERALA",
      "location": "KERALA",
      "workorderNumber": "wo-1788409832605-krlti",
      "style": "PRIYA SAJINI",
      "styleName": "PRIYA SAJINI",
      "size": "34 - 44",
      "cup": "C",
      "quantity": 3e3,
      "orderQty": 3e3,
      "colour": "MIXED",
      "color": "MIXED",
      "id": "cut-pre-e1eylsnzxin-1788410077476",
      "status": "CUTTING",
      "createdAt": "2026-09-03T04:30:32.605Z",
      "createdBy": "ATHUL KRISHNA",
      "submodule": "PRECUTTING",
      "wo": "wo-1788409832605-krlti",
      "checkingDate": "2026-09-02T18:30:00.000Z",
      "date": "2026-09-02T18:30:00.000Z",
      "timestamp": "2026-09-03T04:34:37.476Z",
      "inspector": "SARI SATHYAN",
      "fabricType": "Outer Fabric",
      "relaxingTime": "N/A",
      "cuttableWidth": "145cm",
      "layLength": "4.25mtr",
      "shade": "Z1,",
      "layLengthCheck": "PASS",
      "alignmentCheck": "PASS",
      "plyCountCheck": "PASS",
      "markerCheck": "PASS",
      "ratioCheck": "PASS",
      "checkedQty": 0,
      "pcsChecked": 0,
      "reworkQty": 0,
      "rejectedQty": 0,
      "passQty": 0,
      "failQty": 0,
      "complaintPcs": 0,
      "remarks": "N/A",
      "passAndHold": false,
      "bundleNo": "",
      "reworkPercent": "",
      "rejectionPercent": "",
      "moveToInline": ""
    },
    {
      "zone": "KERALA",
      "location": "KERALA",
      "workorderNumber": "wo-1788409832605-krlti",
      "style": "PRIYA SAJINI",
      "styleName": "PRIYA SAJINI",
      "size": "34 - 44",
      "cup": "C",
      "quantity": 3e3,
      "orderQty": 3e3,
      "colour": "MIXED",
      "color": "MIXED",
      "id": "cut-pre-f645h1xi5f-1788410000488",
      "status": "CUTTING",
      "createdAt": "2026-09-03T04:30:32.605Z",
      "createdBy": "ATHUL KRISHNA",
      "submodule": "PRECUTTING",
      "wo": "wo-1788409832605-krlti",
      "checkingDate": "2026-09-02T18:30:00.000Z",
      "date": "2026-09-02T18:30:00.000Z",
      "timestamp": "2026-09-03T04:33:20.488Z",
      "inspector": "SARI SATHYAN",
      "fabricType": "Inner Fabric",
      "relaxingTime": 24,
      "cuttableWidth": "88cm",
      "layLength": "4.25mtr",
      "shade": "Nil",
      "layLengthCheck": "PASS",
      "alignmentCheck": "PASS",
      "plyCountCheck": "PASS",
      "markerCheck": "PASS",
      "ratioCheck": "PASS",
      "checkedQty": 0,
      "pcsChecked": 0,
      "reworkQty": 0,
      "rejectedQty": 0,
      "passQty": 0,
      "failQty": 0,
      "complaintPcs": 0,
      "remarks": "N/A",
      "passAndHold": true,
      "bundleNo": "",
      "reworkPercent": "",
      "rejectionPercent": "",
      "moveToInline": ""
    }
  ],
  "sewing_reports": [
    {
      "id": "inline_1790320861687_rebr3",
      "zone": "KERALA",
      "location": "KERALA",
      "wo": 30050,
      "workorderNumber": 30050,
      "checkingDate": "2026-09-24T18:30:00.000Z",
      "date": "2026-09-24T18:30:00.000Z",
      "worker": "102 - SYAMALA K K",
      "machine": "M002",
      "round": "12 TO 1.30",
      "roundIndex": 4,
      "checkedQty": 10,
      "pcsChecked": 10,
      "complaintPcs": 3,
      "failQty": 3,
      "remarks": "PASS",
      "itemRemarks": "PASS",
      "generalRemarks": "PASS",
      "item": "",
      "itemName": "",
      "line": "",
      "unit": "MUVATTUPUZHA",
      "style": "PRIYA SAJINI",
      "styleName": "PRIYA SAJINI",
      "color": "NAVY",
      "size": "M",
      "cup": "C",
      "quantity": 2400,
      "orderQty": 2400,
      "inspector": "ADITHYA",
      "timestamp": "2026-09-25T07:21:01.687Z",
      "isOptimistic": true
    }
  ],
  "endline_reports": [
    {
      "id": "endline_bpass_1790321383883_c83is",
      "zone": "KERALA",
      "location": "KERALA",
      "wo": 2201060059,
      "workorderNumber": 2201060059,
      "style": "A 6",
      "styleName": "A 6",
      "color": "MIXED",
      "size": "S",
      "cupsize": "B",
      "cup": "B",
      "line": "LINE 1",
      "unit": "MUVATTUPUZHA",
      "bundleNo": "B10",
      "checkedQty": 10,
      "pcsChecked": 10,
      "passQty": 10,
      "reworkQty": 0,
      "failQty": 0,
      "complaintPcs": 0,
      "worker": "",
      "operation": "",
      "defect": "",
      "machine": "",
      "totalQty": 100,
      "openQty": 0,
      "remarks": "Passed pieces from Bundle B10",
      "inspector": "ADITHYA",
      "timestamp": "2026-09-25T07:29:43.883Z",
      "moveToAQL": true
    },
    {
      "id": "endline_bpass_1790321378251_dbdp4",
      "zone": "KERALA",
      "location": "KERALA",
      "wo": 2201060059,
      "workorderNumber": 2201060059,
      "style": "A 6",
      "styleName": "A 6",
      "color": "MIXED",
      "size": "S",
      "cupsize": "B",
      "cup": "B",
      "line": "LINE 1",
      "unit": "MUVATTUPUZHA",
      "bundleNo": "B8",
      "checkedQty": 10,
      "pcsChecked": 10,
      "passQty": 10,
      "reworkQty": 0,
      "failQty": 0,
      "complaintPcs": 0,
      "worker": "",
      "operation": "",
      "defect": "",
      "machine": "",
      "totalQty": 100,
      "openQty": 20,
      "remarks": "Passed pieces from Bundle B8",
      "inspector": "ADITHYA",
      "timestamp": "2026-09-25T07:29:38.251Z",
      "moveToAQL": false
    },
    {
      "id": "endline_bpass_1790321372290_7jtd3",
      "zone": "KERALA",
      "location": "KERALA",
      "wo": 2201060059,
      "workorderNumber": 2201060059,
      "style": "A 6",
      "styleName": "A 6",
      "color": "MIXED",
      "size": "S",
      "cupsize": "B",
      "cup": "B",
      "line": "LINE 1",
      "unit": "MUVATTUPUZHA",
      "bundleNo": "B8",
      "checkedQty": 10,
      "pcsChecked": 10,
      "passQty": 10,
      "reworkQty": 0,
      "failQty": 0,
      "complaintPcs": 0,
      "worker": "",
      "operation": "",
      "defect": "",
      "machine": "",
      "totalQty": 100,
      "openQty": 20,
      "remarks": "Passed pieces from Bundle B8",
      "inspector": "ADITHYA",
      "timestamp": "2026-09-25T07:29:32.290Z",
      "moveToAQL": false
    },
    {
      "id": "endline_bpass_1790321365565_pw3mi",
      "zone": "KERALA",
      "location": "KERALA",
      "wo": 2201060059,
      "workorderNumber": 2201060059,
      "style": "A 6",
      "styleName": "A 6",
      "color": "MIXED",
      "size": "S",
      "cupsize": "B",
      "cup": "B",
      "line": "LINE 1",
      "unit": "MUVATTUPUZHA",
      "bundleNo": "B7",
      "checkedQty": 10,
      "pcsChecked": 10,
      "passQty": 10,
      "reworkQty": 0,
      "failQty": 0,
      "complaintPcs": 0,
      "worker": "",
      "operation": "",
      "defect": "",
      "machine": "",
      "totalQty": 100,
      "openQty": 30,
      "remarks": "Passed pieces from Bundle B7",
      "inspector": "ADITHYA",
      "timestamp": "2026-09-25T07:29:25.565Z",
      "moveToAQL": false
    },
    {
      "id": "endline_bpass_1790321356954_xykpr",
      "zone": "KERALA",
      "location": "KERALA",
      "wo": 2201060059,
      "workorderNumber": 2201060059,
      "style": "A 6",
      "styleName": "A 6",
      "color": "MIXED",
      "size": "S",
      "cupsize": "B",
      "cup": "B",
      "line": "LINE 1",
      "unit": "MUVATTUPUZHA",
      "bundleNo": "B6",
      "checkedQty": 10,
      "pcsChecked": 10,
      "passQty": 10,
      "reworkQty": 0,
      "failQty": 0,
      "complaintPcs": 0,
      "worker": "",
      "operation": "",
      "defect": "",
      "machine": "",
      "totalQty": 100,
      "openQty": 40,
      "remarks": "Passed pieces from Bundle B6",
      "inspector": "ADITHYA",
      "timestamp": "2026-09-25T07:29:16.954Z",
      "moveToAQL": false
    },
    {
      "id": "endline_bpass_1790321349267_85ax4",
      "zone": "KERALA",
      "location": "KERALA",
      "wo": 2201060059,
      "workorderNumber": 2201060059,
      "style": "A 6",
      "styleName": "A 6",
      "color": "MIXED",
      "size": "S",
      "cupsize": "B",
      "cup": "B",
      "line": "LINE 1",
      "unit": "MUVATTUPUZHA",
      "bundleNo": "B4",
      "checkedQty": 10,
      "pcsChecked": 10,
      "passQty": 10,
      "reworkQty": 0,
      "failQty": 0,
      "complaintPcs": 0,
      "worker": "",
      "operation": "",
      "defect": "",
      "machine": "",
      "totalQty": 100,
      "openQty": 60,
      "remarks": "Passed pieces from Bundle B4",
      "inspector": "ADITHYA",
      "timestamp": "2026-09-25T07:29:09.267Z",
      "moveToAQL": false
    },
    {
      "id": "endline_bpass_1790321343635_nwyzm",
      "zone": "KERALA",
      "location": "KERALA",
      "wo": 2201060059,
      "workorderNumber": 2201060059,
      "style": "A 6",
      "styleName": "A 6",
      "color": "MIXED",
      "size": "S",
      "cupsize": "B",
      "cup": "B",
      "line": "LINE 1",
      "unit": "MUVATTUPUZHA",
      "bundleNo": "B4",
      "checkedQty": 10,
      "pcsChecked": 10,
      "passQty": 10,
      "reworkQty": 0,
      "failQty": 0,
      "complaintPcs": 0,
      "worker": "",
      "operation": "",
      "defect": "",
      "machine": "",
      "totalQty": 100,
      "openQty": 60,
      "remarks": "Passed pieces from Bundle B4",
      "inspector": "ADITHYA",
      "timestamp": "2026-09-25T07:29:03.635Z",
      "moveToAQL": false
    },
    {
      "id": "endline_bpass_1790321338101_r1wz2",
      "zone": "KERALA",
      "location": "KERALA",
      "wo": 2201060059,
      "workorderNumber": 2201060059,
      "style": "A 6",
      "styleName": "A 6",
      "color": "MIXED",
      "size": "S",
      "cupsize": "B",
      "cup": "B",
      "line": "LINE 1",
      "unit": "MUVATTUPUZHA",
      "bundleNo": "B3",
      "checkedQty": 10,
      "pcsChecked": 10,
      "passQty": 10,
      "reworkQty": 0,
      "failQty": 0,
      "complaintPcs": 0,
      "worker": "",
      "operation": "",
      "defect": "",
      "machine": "",
      "totalQty": 100,
      "openQty": 70,
      "remarks": "Passed pieces from Bundle B3",
      "inspector": "ADITHYA",
      "timestamp": "2026-09-25T07:28:58.101Z",
      "moveToAQL": false
    },
    {
      "id": "endline_bpass_1790321332380_lhiqk",
      "zone": "KERALA",
      "location": "KERALA",
      "wo": 2201060059,
      "workorderNumber": 2201060059,
      "style": "A 6",
      "styleName": "A 6",
      "color": "MIXED",
      "size": "S",
      "cupsize": "B",
      "cup": "B",
      "line": "LINE 1",
      "unit": "MUVATTUPUZHA",
      "bundleNo": "B2",
      "checkedQty": 10,
      "pcsChecked": 10,
      "passQty": 10,
      "reworkQty": 0,
      "failQty": 0,
      "complaintPcs": 0,
      "worker": "",
      "operation": "",
      "defect": "",
      "machine": "",
      "totalQty": 100,
      "openQty": 80,
      "remarks": "Passed pieces from Bundle B2",
      "inspector": "ADITHYA",
      "timestamp": "2026-09-25T07:28:52.380Z",
      "moveToAQL": false
    },
    {
      "id": "endline_bpass_1790321324355_dl5bb",
      "zone": "KERALA",
      "location": "KERALA",
      "wo": 2201060059,
      "workorderNumber": 2201060059,
      "style": "A 6",
      "styleName": "A 6",
      "color": "MIXED",
      "size": "S",
      "cupsize": "B",
      "cup": "B",
      "line": "LINE 1",
      "unit": "MUVATTUPUZHA",
      "bundleNo": "B1",
      "checkedQty": 10,
      "pcsChecked": 10,
      "passQty": 10,
      "reworkQty": 0,
      "failQty": 0,
      "complaintPcs": 0,
      "worker": "",
      "operation": "",
      "defect": "",
      "machine": "",
      "totalQty": 100,
      "openQty": 90,
      "remarks": "Passed pieces from Bundle B1",
      "inspector": "ADITHYA",
      "timestamp": "2026-09-25T07:28:44.355Z",
      "moveToAQL": false
    },
    {
      "id": "endline_bpass_1790320948078_7ovmu",
      "zone": "KERALA",
      "location": "KERALA",
      "wo": 30049,
      "workorderNumber": 30049,
      "style": "PRIYA SAJINI",
      "styleName": "PRIYA SAJINI",
      "color": "BLACK",
      "size": "M",
      "cupsize": "B",
      "cup": "B",
      "line": "LINE 1",
      "unit": "MUVATTUPUZHA",
      "bundleNo": "B2",
      "checkedQty": 10,
      "pcsChecked": 10,
      "passQty": 10,
      "reworkQty": 0,
      "failQty": 0,
      "complaintPcs": 0,
      "worker": "",
      "operation": "",
      "defect": "",
      "machine": "",
      "totalQty": 1300,
      "openQty": 1280,
      "remarks": "Passed pieces from Bundle B2",
      "inspector": "ADITHYA",
      "timestamp": "2026-09-25T07:22:28.078Z",
      "moveToAQL": false
    },
    {
      "id": "endline_bpass_1790320941832_b9mnh",
      "zone": "KERALA",
      "location": "KERALA",
      "wo": 30049,
      "workorderNumber": 30049,
      "style": "PRIYA SAJINI",
      "styleName": "PRIYA SAJINI",
      "color": "BLACK",
      "size": "M",
      "cupsize": "B",
      "cup": "B",
      "line": "LINE 1",
      "unit": "MUVATTUPUZHA",
      "bundleNo": "B1",
      "checkedQty": 10,
      "pcsChecked": 10,
      "passQty": 10,
      "reworkQty": 0,
      "failQty": 0,
      "complaintPcs": 0,
      "worker": "",
      "operation": "",
      "defect": "",
      "machine": "",
      "totalQty": 1300,
      "openQty": 1290,
      "remarks": "Passed pieces from Bundle B1",
      "inspector": "ADITHYA",
      "timestamp": "2026-09-25T07:22:21.833Z",
      "moveToAQL": false
    }
  ],
  "aql_reports": [
    {
      "zone": "KERALA",
      "location": "KERALA",
      "wo": 2201060059,
      "workorderNumber": 2201060059,
      "unit": "MUVATTUPUZHA",
      "remarks": "",
      "lotSize": 100,
      "sampleSize": 20,
      "acceptLimit": 0,
      "rejectLimit": 1,
      "totalMinor": 1,
      "totalMajor": 0,
      "equivalentMajor": 0,
      "passQty": 19,
      "failedPieces": 1,
      "complaintPcs": 1,
      "failQty": 1,
      "defectLog": [
        {
          "defectType": "STAIN",
          "minor": 1,
          "major": 0
        }
      ],
      "auditStatus": "PASS",
      "moveToFinal": true,
      "inspector": "ADITHYA",
      "timestamp": "2026-09-25T07:30:57.954Z",
      "checkingDate": "2026-09-24T18:30:00.000Z",
      "date": "2026-09-24T18:30:00.000Z",
      "passAndHold": false
    },
    {
      "zone": "KERALA",
      "location": "KERALA",
      "wo": 2201060059,
      "workorderNumber": 2201060059,
      "unit": "MUVATTUPUZHA",
      "remarks": "",
      "lotSize": 100,
      "sampleSize": 20,
      "acceptLimit": 0,
      "rejectLimit": 1,
      "totalMinor": 2,
      "totalMajor": 10,
      "equivalentMajor": 10,
      "passQty": 8,
      "failedPieces": 12,
      "complaintPcs": 12,
      "failQty": 12,
      "defectLog": [
        {
          "defectType": "HOLE",
          "minor": 2,
          "major": 10
        }
      ],
      "auditStatus": "FAIL",
      "moveToFinal": false,
      "inspector": "ADITHYA",
      "timestamp": "2026-09-25T07:30:25.707Z",
      "checkingDate": "2026-09-24T18:30:00.000Z",
      "date": "2026-09-24T18:30:00.000Z",
      "passAndHold": ""
    }
  ],
  "final_reports": [
    {
      "zone": "KERALA",
      "location": "KERALA",
      "workorderNumber": 2201060059,
      "style": "A 6",
      "styleName": "A 6",
      "size": "30 - 34",
      "cup": "B, F",
      "quantity": 100,
      "orderQty": 100,
      "colour": "MIXED",
      "color": "MIXED",
      "id": "wo-1790321111782-9040e",
      "status": "FINAL",
      "createdAt": "2026-09-25T07:25:11.782Z",
      "createdBy": "ATHUL KRISHNA",
      "wo": 2201060059,
      "unit": "MUVATTUPUZHA",
      "totalAudited": 12,
      "pass": 12,
      "rejected": 0,
      "remarks": "ok",
      "moveToComplete": true,
      "inspector": "ADITHYA",
      "timestamp": "2026-09-25T07:31:34.955Z"
    }
  ],
  "rework_reports": [],
  "reports_sop": [
    {
      "id": "sop-1788951264640",
      "title": "SPEC SHEET   WOVEN FABRIC 100% CTN",
      "category": "Specifications",
      "description": "100% CTN SPEC SHEET",
      "attachmentUrl": '=HYPERLINK("https://drive.google.com/file/d/1DCMxfkz1cEVIwTTzYnk7oICUQL9Ch_US/view?usp=drivesdk", "https://drive.google.com/file/d/1DCMxfkz1cEVIwTTzYnk7oICUQL9Ch_US/view?usp=drivesdk")',
      "attachmentName": "SPEC SHEET - WOVEN FABRIC 100% CTN.pdf",
      "creator": "ADITHYA",
      "creatorCode": "U011",
      "zone": "COMMON",
      "location": "COMMON",
      "timestamp": "2026-09-09T10:54:24.640Z",
      "googleDriveEmail": "",
      "department": "Quality",
      "version": 1,
      "remarks": "KERALA SPEC SHEET",
      "driveFileId": "1DCMxfkz1cEVIwTTzYnk7oICUQL9Ch_US",
      "viewUrl": '=HYPERLINK("https://drive.google.com/file/d/1DCMxfkz1cEVIwTTzYnk7oICUQL9Ch_US/view?usp=drivesdk", "https://drive.google.com/file/d/1DCMxfkz1cEVIwTTzYnk7oICUQL9Ch_US/view?usp=drivesdk")',
      "downloadUrl": '=HYPERLINK("https://drive.google.com/uc?export=download&id=1DCMxfkz1cEVIwTTzYnk7oICUQL9Ch_US", "https://drive.google.com/uc?export=download&id=1DCMxfkz1cEVIwTTzYnk7oICUQL9Ch_US")',
      "fileSize": "195 KB",
      "uploadedBy": "ADITHYA",
      "uploadDate": "2026-09-08T18:30:00.000Z",
      "lastModified": "2026-09-09T10:54:24.640Z",
      "status": "ACTIVE"
    },
    {
      "id": "sop-1790158903912",
      "title": "QMS CROSS FUNCTIONAL    BANGLORE   SEP 2026",
      "category": "Audit Report",
      "description": "Audited by Adithya S Menon",
      "attachmentUrl": '=HYPERLINK("https://drive.google.com/file/d/1ROBAha68ZNJbWy-fwUGcblot2D0KPFgu/view?usp=drivesdk", "https://drive.google.com/file/d/1ROBAha68ZNJbWy-fwUGcblot2D0KPFgu/view?usp=drivesdk")',
      "attachmentName": "QMS CROSS FUNCTIONAL  - BANGLORE - SEP 2026.pdf",
      "creator": "ADITHYA",
      "creatorCode": "U011",
      "zone": "COMMON",
      "location": "COMMON",
      "timestamp": "2026-09-23T10:21:43.912Z",
      "googleDriveEmail": "",
      "department": "Quality",
      "version": 1,
      "remarks": "17.09.2026 - 18.09.2026",
      "driveFileId": "1ROBAha68ZNJbWy-fwUGcblot2D0KPFgu",
      "viewUrl": '=HYPERLINK("https://drive.google.com/file/d/1ROBAha68ZNJbWy-fwUGcblot2D0KPFgu/view?usp=drivesdk", "https://drive.google.com/file/d/1ROBAha68ZNJbWy-fwUGcblot2D0KPFgu/view?usp=drivesdk")',
      "downloadUrl": '=HYPERLINK("https://drive.google.com/uc?export=download&id=1ROBAha68ZNJbWy-fwUGcblot2D0KPFgu", "https://drive.google.com/uc?export=download&id=1ROBAha68ZNJbWy-fwUGcblot2D0KPFgu")',
      "fileSize": "3.54 MB",
      "uploadedBy": "ADITHYA",
      "uploadDate": "2026-09-22T18:30:00.000Z",
      "lastModified": "2026-09-23T10:21:43.912Z",
      "status": "ACTIVE"
    },
    {
      "id": "sop-1790159099256",
      "title": "K N TRADERS VISIT REPORT",
      "category": "Audit Report",
      "description": "VISITED BY ADITHYA S MENON",
      "attachmentUrl": '=HYPERLINK("https://drive.google.com/file/d/1HlmtiEYqyPf7gJUHo0AbsHG8teJqk0A5/view?usp=drivesdk", "https://drive.google.com/file/d/1HlmtiEYqyPf7gJUHo0AbsHG8teJqk0A5/view?usp=drivesdk")',
      "attachmentName": "K N TRADERS VISIT REPORT.pdf",
      "creator": "ADITHYA",
      "creatorCode": "U011",
      "zone": "COMMON",
      "location": "COMMON",
      "timestamp": "2026-09-23T10:24:59.256Z",
      "googleDriveEmail": "",
      "department": "Quality",
      "version": 1,
      "remarks": "14.09.2026",
      "driveFileId": "1HlmtiEYqyPf7gJUHo0AbsHG8teJqk0A5",
      "viewUrl": '=HYPERLINK("https://drive.google.com/file/d/1HlmtiEYqyPf7gJUHo0AbsHG8teJqk0A5/view?usp=drivesdk", "https://drive.google.com/file/d/1HlmtiEYqyPf7gJUHo0AbsHG8teJqk0A5/view?usp=drivesdk")',
      "downloadUrl": '=HYPERLINK("https://drive.google.com/uc?export=download&id=1HlmtiEYqyPf7gJUHo0AbsHG8teJqk0A5", "https://drive.google.com/uc?export=download&id=1HlmtiEYqyPf7gJUHo0AbsHG8teJqk0A5")',
      "fileSize": "860.72 KB",
      "uploadedBy": "ADITHYA",
      "uploadDate": "2026-09-22T18:30:00.000Z",
      "lastModified": "2026-09-23T10:24:59.256Z",
      "status": "ACTIVE"
    },
    {
      "id": "sop-1790159166074",
      "title": "EBO   KANNUR VISIT REPORT",
      "category": "Audit Report",
      "description": "VISITED BY ADITHYA S MENON",
      "attachmentUrl": '=HYPERLINK("https://drive.google.com/file/d/1SRMlBSJG8Xdmmja101M4LiWGgi2eXoI2/view?usp=drivesdk", "https://drive.google.com/file/d/1SRMlBSJG8Xdmmja101M4LiWGgi2eXoI2/view?usp=drivesdk")',
      "attachmentName": "EBO - KANNUR VISIT REPORT.pdf",
      "creator": "ADITHYA",
      "creatorCode": "U011",
      "zone": "COMMON",
      "location": "COMMON",
      "timestamp": "2026-09-23T10:26:06.074Z",
      "googleDriveEmail": "",
      "department": "Quality",
      "version": 1,
      "remarks": "19.09.2026",
      "driveFileId": "1SRMlBSJG8Xdmmja101M4LiWGgi2eXoI2",
      "viewUrl": '=HYPERLINK("https://drive.google.com/file/d/1SRMlBSJG8Xdmmja101M4LiWGgi2eXoI2/view?usp=drivesdk", "https://drive.google.com/file/d/1SRMlBSJG8Xdmmja101M4LiWGgi2eXoI2/view?usp=drivesdk")',
      "downloadUrl": '=HYPERLINK("https://drive.google.com/uc?export=download&id=1SRMlBSJG8Xdmmja101M4LiWGgi2eXoI2", "https://drive.google.com/uc?export=download&id=1SRMlBSJG8Xdmmja101M4LiWGgi2eXoI2")',
      "fileSize": "864.28 KB",
      "uploadedBy": "ADITHYA",
      "uploadDate": "2026-09-22T18:30:00.000Z",
      "lastModified": "2026-09-23T10:26:06.074Z",
      "status": "ACTIVE"
    },
    {
      "id": "sop-1790159332159",
      "title": "SPEC SHEET   KNITTED FABRIC 100% CTN",
      "category": "SOP",
      "description": "KERALA SPEC SHEET",
      "attachmentUrl": '=HYPERLINK("https://drive.google.com/file/d/1odItI5G5_7YJxVtoX4UcUerg05grrdcI/view?usp=drivesdk", "https://drive.google.com/file/d/1odItI5G5_7YJxVtoX4UcUerg05grrdcI/view?usp=drivesdk")',
      "attachmentName": "SPEC SHEET - KNITTED FABRIC 100% CTN.pdf",
      "creator": "ADITHYA",
      "creatorCode": "U011",
      "zone": "COMMON",
      "location": "COMMON",
      "timestamp": "2026-09-23T10:28:52.159Z",
      "googleDriveEmail": "",
      "department": "Quality",
      "version": 1,
      "remarks": "",
      "driveFileId": "1odItI5G5_7YJxVtoX4UcUerg05grrdcI",
      "viewUrl": '=HYPERLINK("https://drive.google.com/file/d/1odItI5G5_7YJxVtoX4UcUerg05grrdcI/view?usp=drivesdk", "https://drive.google.com/file/d/1odItI5G5_7YJxVtoX4UcUerg05grrdcI/view?usp=drivesdk")',
      "downloadUrl": '=HYPERLINK("https://drive.google.com/uc?export=download&id=1odItI5G5_7YJxVtoX4UcUerg05grrdcI", "https://drive.google.com/uc?export=download&id=1odItI5G5_7YJxVtoX4UcUerg05grrdcI")',
      "fileSize": "195.14 KB",
      "uploadedBy": "ADITHYA",
      "uploadDate": "2026-09-22T18:30:00.000Z",
      "lastModified": "2026-09-23T10:28:52.159Z",
      "status": "ACTIVE"
    },
    {
      "id": "sop-1790160101226",
      "title": "SPEC SHEET   TOP & BOTTOM LARGE",
      "category": "Specifications",
      "description": "KERALA SPEC SHEET",
      "attachmentUrl": '=HYPERLINK("https://drive.google.com/file/d/1rYRDeZ7kQg97iHerwteUgI1WGBtNBByq/view?usp=drivesdk", "https://drive.google.com/file/d/1rYRDeZ7kQg97iHerwteUgI1WGBtNBByq/view?usp=drivesdk")',
      "attachmentName": "SPEC SHEET - TOP & BOTTOM LARGE.pdf",
      "creator": "ADITHYA",
      "creatorCode": "U011",
      "zone": "COMMON",
      "location": "COMMON",
      "timestamp": "2026-09-23T10:41:41.226Z",
      "googleDriveEmail": "",
      "department": "Quality",
      "version": 1,
      "remarks": "APPROVED BY MANAGER",
      "driveFileId": "1rYRDeZ7kQg97iHerwteUgI1WGBtNBByq",
      "viewUrl": '=HYPERLINK("https://drive.google.com/file/d/1rYRDeZ7kQg97iHerwteUgI1WGBtNBByq/view?usp=drivesdk", "https://drive.google.com/file/d/1rYRDeZ7kQg97iHerwteUgI1WGBtNBByq/view?usp=drivesdk")',
      "downloadUrl": '=HYPERLINK("https://drive.google.com/uc?export=download&id=1rYRDeZ7kQg97iHerwteUgI1WGBtNBByq", "https://drive.google.com/uc?export=download&id=1rYRDeZ7kQg97iHerwteUgI1WGBtNBByq")',
      "fileSize": "191.83 KB",
      "uploadedBy": "ADITHYA",
      "uploadDate": "2026-09-22T18:30:00.000Z",
      "lastModified": "2026-09-23T10:41:41.226Z",
      "status": "ACTIVE"
    },
    {
      "id": "sop-1790160182897",
      "title": "SPEC SHEET   SIDE ELASTIC",
      "category": "SOP",
      "description": "KERALA SPEC SHEET",
      "attachmentUrl": '=HYPERLINK("https://drive.google.com/file/d/1Zm7aRU6s_KrAYuoyOg2VZEDlUwjrAE0l/view?usp=drivesdk", "https://drive.google.com/file/d/1Zm7aRU6s_KrAYuoyOg2VZEDlUwjrAE0l/view?usp=drivesdk")',
      "attachmentName": "SPEC SHEET - SIDE ELASTIC.pdf",
      "creator": "ADITHYA",
      "creatorCode": "U011",
      "zone": "COMMON",
      "location": "COMMON",
      "timestamp": "2026-09-23T10:43:02.897Z",
      "googleDriveEmail": "",
      "department": "Quality",
      "version": 1,
      "remarks": "APPROVED BY MANAGER",
      "driveFileId": "1Zm7aRU6s_KrAYuoyOg2VZEDlUwjrAE0l",
      "viewUrl": '=HYPERLINK("https://drive.google.com/file/d/1Zm7aRU6s_KrAYuoyOg2VZEDlUwjrAE0l/view?usp=drivesdk", "https://drive.google.com/file/d/1Zm7aRU6s_KrAYuoyOg2VZEDlUwjrAE0l/view?usp=drivesdk")',
      "downloadUrl": '=HYPERLINK("https://drive.google.com/uc?export=download&id=1Zm7aRU6s_KrAYuoyOg2VZEDlUwjrAE0l", "https://drive.google.com/uc?export=download&id=1Zm7aRU6s_KrAYuoyOg2VZEDlUwjrAE0l")',
      "fileSize": "194.67 KB",
      "uploadedBy": "ADITHYA",
      "uploadDate": "2026-09-22T18:30:00.000Z",
      "lastModified": "2026-09-23T10:43:02.897Z",
      "status": "ACTIVE"
    },
    {
      "id": "sop-1790323276278",
      "title": "DISTRIBUTOR VISIT REPORT   PERUMBAVOOR",
      "category": "Audit Report",
      "description": "VISITED ON 24.09.2026",
      "attachmentUrl": '=HYPERLINK("https://drive.google.com/file/d/1kEb0CGk3RcoynMVmzaHCVh9eqpPn78Dt/view?usp=drivesdk", "https://drive.google.com/file/d/1kEb0CGk3RcoynMVmzaHCVh9eqpPn78Dt/view?usp=drivesdk")',
      "attachmentName": "DISTRIBUTOR VISIT REPORT - PERUMBAVOOR.pdf",
      "creator": "ADITHYA",
      "creatorCode": "U011",
      "zone": "COMMON",
      "location": "COMMON",
      "timestamp": "2026-09-25T08:01:16.278Z",
      "googleDriveEmail": "",
      "department": "Quality",
      "version": 1,
      "remarks": "VISITED BY ADITHYA S MENON",
      "driveFileId": "1kEb0CGk3RcoynMVmzaHCVh9eqpPn78Dt",
      "viewUrl": '=HYPERLINK("https://drive.google.com/file/d/1kEb0CGk3RcoynMVmzaHCVh9eqpPn78Dt/view?usp=drivesdk", "https://drive.google.com/file/d/1kEb0CGk3RcoynMVmzaHCVh9eqpPn78Dt/view?usp=drivesdk")',
      "downloadUrl": '=HYPERLINK("https://drive.google.com/uc?export=download&id=1kEb0CGk3RcoynMVmzaHCVh9eqpPn78Dt", "https://drive.google.com/uc?export=download&id=1kEb0CGk3RcoynMVmzaHCVh9eqpPn78Dt")',
      "fileSize": "833.86 KB",
      "uploadedBy": "ADITHYA",
      "uploadDate": "2026-09-24T18:30:00.000Z",
      "lastModified": "2026-09-25T08:01:16.278Z",
      "status": "ACTIVE"
    }
  ],
  "customer_complaints": [
    {
      "id": "cc-1789985372115-we1fet1",
      "dateTime": "2026-09-02T04:35:00.000Z",
      "customerName": "Bright picks Aranattukara",
      "style": "Pretty plus",
      "styleName": "Pretty plus",
      "size": "42 C",
      "complaintDetails": "Shoulder Strap twisted",
      "pcsCount": 1,
      "immediateAction": "Given alert to the EOL checkers and conducted eeting at production floor",
      "rootCause": "Wrong insertion of strap through adjusters",
      "correctiveAction": "CTQ updated in the line and End point, given warning to the specific operator",
      "pendingAction": "",
      "effectiveAfterThreeMonths": "Pending Evaluation",
      "closedOn": "2026-09-08T18:30:00.000Z",
      "images": [],
      "status": "CLOSED",
      "createdBy": "ADITHYA",
      "zone": "ALL",
      "location": "ALL",
      "timestamp": "2026-09-21T10:09:32.115Z"
    },
    {
      "id": "cc-1789985062198-jhyargz",
      "dateTime": "2026-09-01T17:28:00.000Z",
      "customerName": "Kallyan Chalakudy",
      "style": "Woven rings",
      "styleName": "Woven rings",
      "size": "38 C",
      "complaintDetails": "Shoulder strap inserted wrong in adjusters",
      "pcsCount": 1,
      "immediateAction": "",
      "rootCause": "Operator negligence not identified in further operations",
      "correctiveAction": "Made CTQ for the operation and self inspection",
      "pendingAction": "",
      "effectiveAfterThreeMonths": "Pending Evaluation",
      "closedOn": "2026-09-06T18:30:00.000Z",
      "images": [],
      "status": "CLOSED",
      "createdBy": "ADITHYA",
      "zone": "ALL",
      "location": "ALL",
      "timestamp": "2026-09-21T10:10:04.110Z"
    }
  ],
  "zone": [
    {
      "id": "zmap-9222057",
      "zone": "KERALA",
      "unit": "",
      "worker": "",
      "timestamp": "2026-07-06T15:23:35.197Z"
    },
    {
      "id": "zmap-6478025",
      "zone": "KERALA",
      "unit": "MUVATTUPUZHA",
      "worker": "101 - SUSAN V C",
      "timestamp": "2026-09-28T07:51:23.509Z"
    },
    {
      "id": "zmap-8294906",
      "zone": "KERALA",
      "unit": "MUVATTUPUZHA",
      "worker": "102 - SYAMALA K K",
      "timestamp": "2026-09-28T07:51:23.509Z"
    },
    {
      "id": "zmap-6747166",
      "zone": "KERALA",
      "unit": "MUVATTUPUZHA",
      "worker": "106 - SHEELA N K",
      "timestamp": "2026-09-28T07:51:23.509Z"
    },
    {
      "id": "zmap-4182670",
      "zone": "KERALA",
      "unit": "MUVATTUPUZHA",
      "worker": "108 - SUJATHA K O",
      "timestamp": "2026-09-28T07:51:23.509Z"
    },
    {
      "id": "zmap-4706020",
      "zone": "KERALA",
      "unit": "MUVATTUPUZHA",
      "worker": "112 - PREETHA VINODKUMAR",
      "timestamp": "2026-09-28T07:51:23.509Z"
    },
    {
      "id": "zmap-7487825",
      "zone": "KERALA",
      "unit": "MUVATTUPUZHA",
      "worker": "1128 - AJITHA M V",
      "timestamp": "2026-09-28T07:51:23.509Z"
    },
    {
      "id": "zmap-312234",
      "zone": "KERALA",
      "unit": "MUVATTUPUZHA",
      "worker": "1129 - VIMALA N C",
      "timestamp": "2026-09-28T07:51:23.509Z"
    },
    {
      "id": "zmap-5866312",
      "zone": "KERALA",
      "unit": "MUVATTUPUZHA",
      "worker": "113 - KRISHNA GIREESH",
      "timestamp": "2026-09-28T07:51:23.509Z"
    },
    {
      "id": "zmap-2831371",
      "zone": "KERALA",
      "unit": "MUVATTUPUZHA",
      "worker": "1132 - SABITHA K M",
      "timestamp": "2026-09-28T07:51:23.509Z"
    },
    {
      "id": "zmap-1606236",
      "zone": "KERALA",
      "unit": "MUVATTUPUZHA",
      "worker": "115 - JANCY GEORGE",
      "timestamp": "2026-09-28T07:51:23.509Z"
    },
    {
      "id": "zmap-4880018",
      "zone": "KERALA",
      "unit": "MUVATTUPUZHA",
      "worker": "1152 - BINDU P K",
      "timestamp": "2026-09-28T07:51:23.509Z"
    },
    {
      "id": "zmap-5520992",
      "zone": "KERALA",
      "unit": "MUVATTUPUZHA",
      "worker": "121 - VIJAYAMMA JAYAN",
      "timestamp": "2026-09-28T07:51:23.509Z"
    },
    {
      "id": "zmap-5177481",
      "zone": "KERALA",
      "unit": "MUVATTUPUZHA",
      "worker": "1240 - VINITHA",
      "timestamp": "2026-09-28T07:51:23.509Z"
    },
    {
      "id": "zmap-8007528",
      "zone": "KERALA",
      "unit": "MUVATTUPUZHA",
      "worker": "1245 - SANDHYA SUBHASH",
      "timestamp": "2026-09-28T07:51:23.509Z"
    },
    {
      "id": "zmap-6141162",
      "zone": "KERALA",
      "unit": "MUVATTUPUZHA",
      "worker": "1246 - GINIMOL",
      "timestamp": "2026-09-28T07:51:23.509Z"
    },
    {
      "id": "zmap-4798153",
      "zone": "KERALA",
      "unit": "MUVATTUPUZHA",
      "worker": "1247 - DEEPA K M",
      "timestamp": "2026-09-28T07:51:23.509Z"
    },
    {
      "id": "zmap-9199815",
      "zone": "KERALA",
      "unit": "MUVATTUPUZHA",
      "worker": "126 - SANTHA SHAJI",
      "timestamp": "2026-09-28T07:51:23.509Z"
    },
    {
      "id": "zmap-7475811",
      "zone": "KERALA",
      "unit": "MUVATTUPUZHA",
      "worker": "128 - SAJITHA V K",
      "timestamp": "2026-09-28T07:51:23.509Z"
    },
    {
      "id": "zmap-3099689",
      "zone": "KERALA",
      "unit": "MUVATTUPUZHA",
      "worker": "130 - SOBHANA VIJAYAN",
      "timestamp": "2026-09-28T07:51:23.509Z"
    },
    {
      "id": "zmap-3992599",
      "zone": "KERALA",
      "unit": "MUVATTUPUZHA",
      "worker": "136 - JULI SUNNY",
      "timestamp": "2026-09-28T07:51:23.509Z"
    },
    {
      "id": "zmap-4490409",
      "zone": "KERALA",
      "unit": "MUVATTUPUZHA",
      "worker": "1367 - RAMESH KARAKARIA",
      "timestamp": "2026-09-28T07:51:23.509Z"
    },
    {
      "id": "zmap-909574",
      "zone": "KERALA",
      "unit": "MUVATTUPUZHA",
      "worker": "137 - P K LATHA",
      "timestamp": "2026-09-28T07:51:23.509Z"
    },
    {
      "id": "zmap-568135",
      "zone": "KERALA",
      "unit": "MUVATTUPUZHA",
      "worker": "1398 - SANITHA SUNIL",
      "timestamp": "2026-09-28T07:51:23.509Z"
    },
    {
      "id": "zmap-6445035",
      "zone": "KERALA",
      "unit": "MUVATTUPUZHA",
      "worker": "14 - SUNIL K V",
      "timestamp": "2026-09-28T07:51:23.509Z"
    },
    {
      "id": "zmap-4358105",
      "zone": "KERALA",
      "unit": "MUVATTUPUZHA",
      "worker": "1435 - NEETHU ANTONY",
      "timestamp": "2026-09-28T07:51:23.509Z"
    },
    {
      "id": "zmap-6970145",
      "zone": "KERALA",
      "unit": "MUVATTUPUZHA",
      "worker": "1459 - SOUMYA RAJAN",
      "timestamp": "2026-09-28T07:51:23.509Z"
    },
    {
      "id": "zmap-9019280",
      "zone": "KERALA",
      "unit": "MUVATTUPUZHA",
      "worker": "147 - SHIJI SAJU",
      "timestamp": "2026-09-28T07:51:23.509Z"
    },
    {
      "id": "zmap-1279494",
      "zone": "KERALA",
      "unit": "MUVATTUPUZHA",
      "worker": "1490 - MINI JOHN",
      "timestamp": "2026-09-28T07:51:23.509Z"
    },
    {
      "id": "zmap-5242650",
      "zone": "KERALA",
      "unit": "MUVATTUPUZHA",
      "worker": "1541 - JOLLY THOMAS",
      "timestamp": "2026-09-28T07:51:23.509Z"
    },
    {
      "id": "zmap-9326699",
      "zone": "KERALA",
      "unit": "MUVATTUPUZHA",
      "worker": "1553 - BINILA P K",
      "timestamp": "2026-09-28T07:51:23.509Z"
    },
    {
      "id": "zmap-4154098",
      "zone": "KERALA",
      "unit": "MUVATTUPUZHA",
      "worker": "1675 - SALINI A B",
      "timestamp": "2026-09-28T07:51:23.509Z"
    },
    {
      "id": "zmap-6556045",
      "zone": "KERALA",
      "unit": "MUVATTUPUZHA",
      "worker": "1676 - LAYA UMESH",
      "timestamp": "2026-09-28T07:51:23.509Z"
    },
    {
      "id": "zmap-8539641",
      "zone": "KERALA",
      "unit": "MUVATTUPUZHA",
      "worker": "1795 - SOBINI SOMAN",
      "timestamp": "2026-09-28T07:51:23.509Z"
    },
    {
      "id": "zmap-9440992",
      "zone": "KERALA",
      "unit": "MUVATTUPUZHA",
      "worker": "1860 - REMYA SHINO",
      "timestamp": "2026-09-28T07:51:23.509Z"
    },
    {
      "id": "zmap-9618436",
      "zone": "KERALA",
      "unit": "MUVATTUPUZHA",
      "worker": "189 - SONIYA BABY",
      "timestamp": "2026-09-28T07:51:23.509Z"
    },
    {
      "id": "zmap-9439298",
      "zone": "KERALA",
      "unit": "MUVATTUPUZHA",
      "worker": "195 - LIJIMOLE C V",
      "timestamp": "2026-09-28T07:51:23.509Z"
    },
    {
      "id": "zmap-9149606",
      "zone": "KERALA",
      "unit": "MUVATTUPUZHA",
      "worker": "1972 - SANJU KUMAR HANSDA",
      "timestamp": "2026-09-28T07:51:23.509Z"
    },
    {
      "id": "zmap-6692963",
      "zone": "KERALA",
      "unit": "MUVATTUPUZHA",
      "worker": "214 - SUDHA VIJAYAN",
      "timestamp": "2026-09-28T07:51:23.509Z"
    },
    {
      "id": "zmap-8280918",
      "zone": "KERALA",
      "unit": "MUVATTUPUZHA",
      "worker": "225 - VINEETHA M D",
      "timestamp": "2026-09-28T07:51:23.509Z"
    },
    {
      "id": "zmap-9355147",
      "zone": "KERALA",
      "unit": "MUVATTUPUZHA",
      "worker": "2274 - AJIMOL K A",
      "timestamp": "2026-09-28T07:51:23.509Z"
    },
    {
      "id": "zmap-8596381",
      "zone": "KERALA",
      "unit": "MUVATTUPUZHA",
      "worker": "228 - JAYA M A",
      "timestamp": "2026-09-28T07:51:23.509Z"
    },
    {
      "id": "zmap-68564",
      "zone": "KERALA",
      "unit": "MUVATTUPUZHA",
      "worker": "229 - SHEELA SURESH",
      "timestamp": "2026-09-28T07:51:23.509Z"
    },
    {
      "id": "zmap-5897971",
      "zone": "KERALA",
      "unit": "MUVATTUPUZHA",
      "worker": "2317 - REJITHA SAJEEV",
      "timestamp": "2026-09-28T07:51:23.509Z"
    },
    {
      "id": "zmap-1873869",
      "zone": "KERALA",
      "unit": "MUVATTUPUZHA",
      "worker": "2318 - BINDU T T",
      "timestamp": "2026-09-28T07:51:23.509Z"
    },
    {
      "id": "zmap-1688555",
      "zone": "KERALA",
      "unit": "MUVATTUPUZHA",
      "worker": "232 - SARITHA BIJU",
      "timestamp": "2026-09-28T07:51:23.509Z"
    },
    {
      "id": "zmap-4861724",
      "zone": "KERALA",
      "unit": "MUVATTUPUZHA",
      "worker": "2334 - BEENA SREERAJ",
      "timestamp": "2026-09-28T07:51:23.509Z"
    },
    {
      "id": "zmap-9634106",
      "zone": "KERALA",
      "unit": "MUVATTUPUZHA",
      "worker": "2339 - PRIYA GIBI",
      "timestamp": "2026-09-28T07:51:23.509Z"
    },
    {
      "id": "zmap-5105793",
      "zone": "KERALA",
      "unit": "MUVATTUPUZHA",
      "worker": "2354 - SHAIJA KRISHNANKUTTY",
      "timestamp": "2026-09-28T07:51:23.509Z"
    },
    {
      "id": "zmap-2940002",
      "zone": "KERALA",
      "unit": "MUVATTUPUZHA",
      "worker": "2427 - SINDHU GEORGE",
      "timestamp": "2026-09-28T07:51:23.509Z"
    },
    {
      "id": "zmap-9932244",
      "zone": "KERALA",
      "unit": "MUVATTUPUZHA",
      "worker": "2532 - PRIYA K THANKAPPAN",
      "timestamp": "2026-09-28T07:51:23.509Z"
    },
    {
      "id": "zmap-1187234",
      "zone": "KERALA",
      "unit": "MUVATTUPUZHA",
      "worker": "2535 - PREEJA JEEMON",
      "timestamp": "2026-09-28T07:51:23.509Z"
    },
    {
      "id": "zmap-3269421",
      "zone": "KERALA",
      "unit": "MUVATTUPUZHA",
      "worker": "2536 - AJITHA BIJU",
      "timestamp": "2026-09-28T07:51:23.509Z"
    },
    {
      "id": "zmap-6972916",
      "zone": "KERALA",
      "unit": "MUVATTUPUZHA",
      "worker": "260 - LATHA K B",
      "timestamp": "2026-09-28T07:51:23.509Z"
    },
    {
      "id": "zmap-2827058",
      "zone": "KERALA",
      "unit": "MUVATTUPUZHA",
      "worker": "2630 - JALAJA KRISHNAN",
      "timestamp": "2026-09-28T07:51:23.509Z"
    },
    {
      "id": "zmap-5658045",
      "zone": "KERALA",
      "unit": "MUVATTUPUZHA",
      "worker": "2631 - SURAMYA PK",
      "timestamp": "2026-09-28T07:51:23.509Z"
    },
    {
      "id": "zmap-3683923",
      "zone": "KERALA",
      "unit": "MUVATTUPUZHA",
      "worker": "2640 - SUJATHA PRAKASAN",
      "timestamp": "2026-09-28T07:51:23.509Z"
    },
    {
      "id": "zmap-2730514",
      "zone": "KERALA",
      "unit": "MUVATTUPUZHA",
      "worker": "2645 - SUKANYA KUMAR CK",
      "timestamp": "2026-09-28T07:51:23.509Z"
    },
    {
      "id": "zmap-5189880",
      "zone": "KERALA",
      "unit": "MUVATTUPUZHA",
      "worker": "2650 - AMRITHA RAJAN",
      "timestamp": "2026-09-28T07:51:23.509Z"
    },
    {
      "id": "zmap-8419538",
      "zone": "KERALA",
      "unit": "MUVATTUPUZHA",
      "worker": "2659 - SABITHA",
      "timestamp": "2026-09-28T07:51:23.509Z"
    },
    {
      "id": "zmap-3223796",
      "zone": "KERALA",
      "unit": "MUVATTUPUZHA",
      "worker": "267 - NITHA C V",
      "timestamp": "2026-09-28T07:51:23.509Z"
    },
    {
      "id": "zmap-2392329",
      "zone": "KERALA",
      "unit": "MUVATTUPUZHA",
      "worker": "2704 - RAMYA SREE MOHANAN",
      "timestamp": "2026-09-28T07:51:23.509Z"
    },
    {
      "id": "zmap-2174412",
      "zone": "KERALA",
      "unit": "MUVATTUPUZHA",
      "worker": "2705 - SHIJI PR",
      "timestamp": "2026-09-28T07:51:23.509Z"
    },
    {
      "id": "zmap-8082682",
      "zone": "KERALA",
      "unit": "MUVATTUPUZHA",
      "worker": "2765 - NISHA CP",
      "timestamp": "2026-09-28T07:51:23.509Z"
    },
    {
      "id": "zmap-8927123",
      "zone": "KERALA",
      "unit": "MUVATTUPUZHA",
      "worker": "2767 - KALEESWARI A",
      "timestamp": "2026-09-28T07:51:23.509Z"
    },
    {
      "id": "zmap-4482151",
      "zone": "KERALA",
      "unit": "MUVATTUPUZHA",
      "worker": "2774 - BINAYA PRADHAN",
      "timestamp": "2026-09-28T07:51:23.509Z"
    },
    {
      "id": "zmap-8751290",
      "zone": "KERALA",
      "unit": "MUVATTUPUZHA",
      "worker": "2811 - RATHEESHKUMAR R",
      "timestamp": "2026-09-28T07:51:23.509Z"
    },
    {
      "id": "zmap-357627",
      "zone": "KERALA",
      "unit": "MUVATTUPUZHA",
      "worker": "308 - RADHA M N",
      "timestamp": "2026-09-28T07:51:23.509Z"
    },
    {
      "id": "zmap-8284490",
      "zone": "KERALA",
      "unit": "MUVATTUPUZHA",
      "worker": "31 - USHA BABY",
      "timestamp": "2026-09-28T07:51:23.509Z"
    },
    {
      "id": "zmap-4474728",
      "zone": "KERALA",
      "unit": "MUVATTUPUZHA",
      "worker": "321 - SWAPNA SANTHOSH",
      "timestamp": "2026-09-28T07:51:23.509Z"
    },
    {
      "id": "zmap-8121785",
      "zone": "KERALA",
      "unit": "MUVATTUPUZHA",
      "worker": "322 - SOUMYA KRISHNAN",
      "timestamp": "2026-09-28T07:51:23.509Z"
    },
    {
      "id": "zmap-312086",
      "zone": "KERALA",
      "unit": "MUVATTUPUZHA",
      "worker": "333 - MANJU SAJI",
      "timestamp": "2026-09-28T07:51:23.509Z"
    },
    {
      "id": "zmap-5760180",
      "zone": "KERALA",
      "unit": "MUVATTUPUZHA",
      "worker": "351 - SANDHYA KRISHNAN",
      "timestamp": "2026-09-28T07:51:23.509Z"
    },
    {
      "id": "zmap-6965018",
      "zone": "KERALA",
      "unit": "MUVATTUPUZHA",
      "worker": "371 - SUNIMOL A K",
      "timestamp": "2026-09-28T07:51:23.509Z"
    },
    {
      "id": "zmap-1244343",
      "zone": "KERALA",
      "unit": "MUVATTUPUZHA",
      "worker": "384 - ANITHA SIVAN",
      "timestamp": "2026-09-28T07:51:23.509Z"
    },
    {
      "id": "zmap-4469855",
      "zone": "KERALA",
      "unit": "MUVATTUPUZHA",
      "worker": "42 - SIJI VARGHESE",
      "timestamp": "2026-09-28T07:51:23.509Z"
    },
    {
      "id": "zmap-4165134",
      "zone": "KERALA",
      "unit": "MUVATTUPUZHA",
      "worker": "511 - BINDU GOPALAN",
      "timestamp": "2026-09-28T07:51:23.509Z"
    },
    {
      "id": "zmap-5938394",
      "zone": "KERALA",
      "unit": "MUVATTUPUZHA",
      "worker": "6 - PAILYKUNJU T P",
      "timestamp": "2026-09-28T07:51:23.509Z"
    },
    {
      "id": "zmap-1165296",
      "zone": "KERALA",
      "unit": "MUVATTUPUZHA",
      "worker": "644 - DHANYA REVI",
      "timestamp": "2026-09-28T07:51:23.509Z"
    },
    {
      "id": "zmap-963669",
      "zone": "KERALA",
      "unit": "MUVATTUPUZHA",
      "worker": "654 - SUJATHA",
      "timestamp": "2026-09-28T07:51:23.509Z"
    },
    {
      "id": "zmap-4011924",
      "zone": "KERALA",
      "unit": "MUVATTUPUZHA",
      "worker": "681 - SINI N M",
      "timestamp": "2026-09-28T07:51:23.509Z"
    },
    {
      "id": "zmap-8557881",
      "zone": "KERALA",
      "unit": "MUVATTUPUZHA",
      "worker": "69 - SINDHU GIGI",
      "timestamp": "2026-09-28T07:51:23.509Z"
    },
    {
      "id": "zmap-2960451",
      "zone": "KERALA",
      "unit": "MUVATTUPUZHA",
      "worker": "70 - GEETHA S",
      "timestamp": "2026-09-28T07:51:23.509Z"
    },
    {
      "id": "zmap-4459440",
      "zone": "KERALA",
      "unit": "MUVATTUPUZHA",
      "worker": "72 - SANI BABY",
      "timestamp": "2026-09-28T07:51:23.509Z"
    },
    {
      "id": "zmap-1617660",
      "zone": "KERALA",
      "unit": "MUVATTUPUZHA",
      "worker": "73 - SALY JOHN",
      "timestamp": "2026-09-28T07:51:23.509Z"
    },
    {
      "id": "zmap-3554952",
      "zone": "KERALA",
      "unit": "MUVATTUPUZHA",
      "worker": "74 - SUSEELA SHIBU",
      "timestamp": "2026-09-28T07:51:23.509Z"
    },
    {
      "id": "zmap-964107",
      "zone": "KERALA",
      "unit": "MUVATTUPUZHA",
      "worker": "79 - RAJANI N",
      "timestamp": "2026-09-28T07:51:23.509Z"
    },
    {
      "id": "zmap-2755965",
      "zone": "KERALA",
      "unit": "MUVATTUPUZHA",
      "worker": "84 - LATHIKA VISWANATHAN",
      "timestamp": "2026-09-28T07:51:23.509Z"
    },
    {
      "id": "zmap-6534458",
      "zone": "KERALA",
      "unit": "MUVATTUPUZHA",
      "worker": "86 - GEETHA V U",
      "timestamp": "2026-09-28T07:51:23.509Z"
    },
    {
      "id": "zmap-1648518",
      "zone": "KERALA",
      "unit": "MUVATTUPUZHA",
      "worker": "87 - OMANA E A",
      "timestamp": "2026-09-28T07:51:23.509Z"
    },
    {
      "id": "zmap-4419653",
      "zone": "KERALA",
      "unit": "MUVATTUPUZHA",
      "worker": "92 - PAUL N J",
      "timestamp": "2026-09-28T07:51:23.509Z"
    },
    {
      "id": "zmap-3951116",
      "zone": "KERALA",
      "unit": "MUVATTUPUZHA",
      "worker": "934 - SIJO VARGHESE",
      "timestamp": "2026-09-28T07:51:23.509Z"
    },
    {
      "id": "zmap-7107807",
      "zone": "KERALA",
      "unit": "MUVATTUPUZHA",
      "worker": "94 - P K SHEELA",
      "timestamp": "2026-09-28T07:51:23.509Z"
    },
    {
      "id": "zmap-2788596",
      "zone": "KERALA",
      "unit": "MUVATTUPUZHA",
      "worker": "95 - SHAINY K J",
      "timestamp": "2026-09-28T07:51:23.509Z"
    },
    {
      "id": "zmap-9769858",
      "zone": "KERALA",
      "unit": "MUVATTUPUZHA",
      "worker": "97 - SINDHU JOJI",
      "timestamp": "2026-09-28T07:51:23.509Z"
    },
    {
      "id": "zmap-4632548",
      "zone": "KERALA",
      "unit": "MUVATTUPUZHA",
      "worker": "98 - SINI K N",
      "timestamp": "2026-09-28T07:51:23.509Z"
    },
    {
      "id": "zmap-530284",
      "zone": "KERALA",
      "unit": "ANGAMALY",
      "worker": "ADITHYA",
      "timestamp": "2026-09-28T07:51:23.517Z"
    },
    {
      "id": "zmap-399266",
      "zone": "KERALA",
      "unit": "ANGAMALY",
      "worker": "GOPAKUMAR",
      "timestamp": "2026-09-28T07:51:23.517Z"
    },
    {
      "id": "zmap-8593842",
      "zone": "KERALA",
      "unit": "ANGAMALY",
      "worker": "ASHOK",
      "timestamp": "2026-09-28T07:51:23.517Z"
    },
    {
      "id": "zmap-7478082",
      "zone": "KERALA",
      "unit": "ANGAMALY",
      "worker": "ASHIR",
      "timestamp": "2026-09-28T07:51:23.517Z"
    },
    {
      "id": "zmap-5233385",
      "zone": "KERALA",
      "unit": "ANGAMALY",
      "worker": "SREEJITH",
      "timestamp": "2026-09-28T07:51:23.517Z"
    },
    {
      "id": "zmap-1062723",
      "zone": "KERALA",
      "unit": "ANGAMALY",
      "worker": "SHARATH",
      "timestamp": "2026-09-28T07:51:23.517Z"
    },
    {
      "id": "zmap-1462955",
      "zone": "KERALA",
      "unit": "ANGAMALY",
      "worker": "CHRISTY",
      "timestamp": "2026-09-28T07:51:23.517Z"
    },
    {
      "id": "zmap-1984128",
      "zone": "KERALA",
      "unit": "ANGAMALY",
      "worker": "MIDHUN",
      "timestamp": "2026-09-28T07:51:23.517Z"
    },
    {
      "id": "zmap-177980",
      "zone": "KERALA",
      "unit": "RAW MATERIAL STORE",
      "worker": "",
      "timestamp": "2026-07-18T09:53:07.380Z"
    },
    {
      "id": "zmap-2101233",
      "zone": "TIRUPUR",
      "unit": "",
      "worker": "",
      "timestamp": "2026-08-05T09:07:53.653Z"
    },
    {
      "id": "zmap-997944",
      "zone": "TIRUPUR",
      "unit": "RAW MATERIAL STORE - TUP",
      "worker": "",
      "timestamp": "2026-08-05T09:08:18.744Z"
    },
    {
      "id": "zmap-6453795",
      "zone": "BANGALORE",
      "unit": "",
      "worker": "",
      "timestamp": "2026-08-05T09:09:04.058Z"
    },
    {
      "id": "zmap-6649572",
      "zone": "BANGALORE",
      "unit": "RAW MATERIAL STORE - BNGLR",
      "worker": "",
      "timestamp": "2026-08-05T09:09:39.256Z"
    }
  ],
  "admin_logs": [
    {
      "timestamp": "2026-07-06T15:18:13.963Z",
      "module": "USER_MGMT",
      "action": "SAVE_USERS",
      "details": "Saved record to USERS",
      "admin": "SYSTEM"
    },
    {
      "timestamp": "2026-07-06T15:18:15.163Z",
      "module": "USER_MGMT",
      "action": "SAVE_USERS",
      "details": "Saved record to USERS",
      "admin": "SYSTEM"
    },
    {
      "timestamp": "2026-07-06T15:18:17.012Z",
      "module": "USER_MGMT",
      "action": "SAVE_USERS",
      "details": "Saved record to USERS",
      "admin": "SYSTEM"
    },
    {
      "timestamp": "2026-07-06T15:18:17.377Z",
      "module": "USER_MGMT",
      "action": "SAVE_USERS",
      "details": "Saved record to USERS",
      "admin": "SYSTEM"
    },
    {
      "timestamp": "2026-07-06T15:18:18.332Z",
      "module": "USER_MGMT",
      "action": "SAVE_USERS",
      "details": "Saved record to USERS",
      "admin": "SYSTEM"
    },
    {
      "timestamp": "2026-07-06T15:18:22.696Z",
      "module": "USER_MGMT",
      "action": "SAVE_USERS",
      "details": "Saved record to USERS",
      "admin": "SYSTEM"
    },
    {
      "timestamp": "2026-07-06T15:18:23.424Z",
      "module": "USER_MGMT",
      "action": "SAVE_USERS",
      "details": "Saved record to USERS",
      "admin": "SYSTEM"
    },
    {
      "timestamp": "2026-07-06T15:18:25.203Z",
      "module": "USER_MGMT",
      "action": "SAVE_USERS",
      "details": "Saved record to USERS",
      "admin": "SYSTEM"
    },
    {
      "timestamp": "2026-07-06T15:18:46.127Z",
      "module": "USER_MGMT",
      "action": "SAVE_USERS",
      "details": "Saved record to USERS",
      "admin": "SYSTEM"
    },
    {
      "timestamp": "2026-07-06T15:18:46.833Z",
      "module": "USER_MGMT",
      "action": "SAVE_USERS",
      "details": "Saved record to USERS",
      "admin": "SYSTEM"
    },
    {
      "timestamp": "2026-07-06T15:18:47.431Z",
      "module": "USER_MGMT",
      "action": "SAVE_USERS",
      "details": "Saved record to USERS",
      "admin": "SYSTEM"
    },
    {
      "timestamp": "2026-07-06T15:18:47.577Z",
      "module": "USER_MGMT",
      "action": "SAVE_USERS",
      "details": "Saved record to USERS",
      "admin": "SYSTEM"
    },
    {
      "timestamp": "2026-07-06T15:18:48.386Z",
      "module": "USER_MGMT",
      "action": "SAVE_USERS",
      "details": "Saved record to USERS",
      "admin": "SYSTEM"
    },
    {
      "timestamp": "2026-07-06T15:18:49.178Z",
      "module": "USER_MGMT",
      "action": "SAVE_USERS",
      "details": "Saved record to USERS",
      "admin": "SYSTEM"
    },
    {
      "timestamp": "2026-07-06T15:18:52.640Z",
      "module": "USER_MGMT",
      "action": "SAVE_USERS",
      "details": "Saved record to USERS",
      "admin": "SYSTEM"
    },
    {
      "timestamp": "2026-07-06T15:18:53.814Z",
      "module": "USER_MGMT",
      "action": "SAVE_USERS",
      "details": "Saved record to USERS",
      "admin": "SYSTEM"
    },
    {
      "timestamp": "2026-07-06T15:18:54.553Z",
      "module": "USER_MGMT",
      "action": "SAVE_USERS",
      "details": "Saved record to USERS",
      "admin": "SYSTEM"
    },
    {
      "timestamp": "2026-07-06T15:21:20.741Z",
      "module": "USER_MGMT",
      "action": "SAVE_USERS",
      "details": "Saved record to USERS",
      "admin": "SYSTEM"
    },
    {
      "timestamp": "2026-07-06T15:21:21.393Z",
      "module": "USER_MGMT",
      "action": "SAVE_USERS",
      "details": "Saved record to USERS",
      "admin": "SYSTEM"
    },
    {
      "timestamp": "2026-07-06T15:21:23.200Z",
      "module": "USER_MGMT",
      "action": "SAVE_USERS",
      "details": "Saved record to USERS",
      "admin": "SYSTEM"
    },
    {
      "timestamp": "2026-07-06T15:25:37.166Z",
      "module": "USER_MGMT",
      "action": "SAVE_USERS",
      "details": "Saved record to USERS",
      "admin": "SYSTEM"
    },
    {
      "timestamp": "2026-07-06T15:25:47.118Z",
      "module": "SYSTEM",
      "action": "ADD USER",
      "details": "Created user U002 (NIMMY)",
      "admin": "admin"
    },
    {
      "timestamp": "2026-07-06T15:28:09.258Z",
      "module": "USER_MGMT",
      "action": "EDIT USER",
      "details": "Updated User U002 (NIMMY)",
      "admin": "SYSTEM"
    },
    {
      "timestamp": "2026-07-06T15:28:18.953Z",
      "module": "SYSTEM",
      "action": "EDIT USER",
      "details": "Updated user U002",
      "admin": "admin"
    },
    {
      "timestamp": "2026-07-06T15:30:52.716Z",
      "module": "USER_MGMT",
      "action": "SAVE_USERS",
      "details": "Saved record to USERS",
      "admin": "SYSTEM"
    },
    {
      "timestamp": "2026-07-06T15:31:06.754Z",
      "module": "SYSTEM",
      "action": "ADD USER",
      "details": "Created user U003 (ADITHYA)",
      "admin": "admin"
    },
    {
      "timestamp": "2026-07-06T15:35:59.297Z",
      "module": "USER_MGMT",
      "action": "SAVE_USERS",
      "details": "Saved record to USERS",
      "admin": "SYSTEM"
    },
    {
      "timestamp": "2026-07-06T15:36:18.735Z",
      "module": "SYSTEM",
      "action": "ADD USER",
      "details": "Created user U004 (VISHNUKUMAR)",
      "admin": "admin"
    },
    {
      "timestamp": "2026-07-06T15:47:41.978Z",
      "module": "USER_MGMT",
      "action": "SAVE_USERS",
      "details": "Saved record to USERS",
      "admin": "SYSTEM"
    },
    {
      "timestamp": "2026-07-06T15:48:13.053Z",
      "module": "SYSTEM",
      "action": "ADD USER",
      "details": "Created user U005 (SONY)",
      "admin": "admin"
    },
    {
      "timestamp": "2026-07-07T06:17:49.776Z",
      "module": "USER_MGMT",
      "action": "EDIT USER",
      "details": "Updated User U005 (SONY)",
      "admin": "SYSTEM"
    },
    {
      "timestamp": "2026-07-07T06:17:53.491Z",
      "module": "USER_MGMT",
      "action": "EDIT USER",
      "details": "Updated User U005 (SONY)",
      "admin": "SYSTEM"
    },
    {
      "timestamp": "2026-07-07T06:17:53.649Z",
      "module": "USER_MGMT",
      "action": "EDIT USER",
      "details": "Updated User U005 (SONY)",
      "admin": "SYSTEM"
    },
    {
      "timestamp": "2026-07-07T06:17:54.184Z",
      "module": "USER_MGMT",
      "action": "EDIT USER",
      "details": "Updated User U005 (SONY)",
      "admin": "SYSTEM"
    },
    {
      "timestamp": "2026-07-07T06:17:54.550Z",
      "module": "USER_MGMT",
      "action": "EDIT USER",
      "details": "Updated User U005 (SONY)",
      "admin": "SYSTEM"
    },
    {
      "timestamp": "2026-07-07T06:17:55.452Z",
      "module": "USER_MGMT",
      "action": "EDIT USER",
      "details": "Updated User U005 (SONY)",
      "admin": "SYSTEM"
    },
    {
      "timestamp": "2026-07-07T06:17:55.395Z",
      "module": "USER_MGMT",
      "action": "EDIT USER",
      "details": "Updated User U005 (SONY)",
      "admin": "SYSTEM"
    },
    {
      "timestamp": "2026-07-07T06:17:56.101Z",
      "module": "SYSTEM",
      "action": "RESTRICTION CHANGE",
      "details": "Updated DOWNLOAD_RESTRICTION for U005",
      "admin": "admin"
    },
    {
      "timestamp": "2026-07-07T06:17:56.720Z",
      "module": "USER_MGMT",
      "action": "EDIT USER",
      "details": "Updated User U005 (SONY)",
      "admin": "SYSTEM"
    },
    {
      "timestamp": "2026-07-07T06:17:59.343Z",
      "module": "SYSTEM",
      "action": "RESTRICTION CHANGE",
      "details": "Updated A3 for U005",
      "admin": "admin"
    },
    {
      "timestamp": "2026-07-07T06:17:59.703Z",
      "module": "SYSTEM",
      "action": "RESTRICTION CHANGE",
      "details": "Updated A5 for U005",
      "admin": "admin"
    },
    {
      "timestamp": "2026-07-07T06:17:59.033Z",
      "module": "USER_MGMT",
      "action": "EDIT USER",
      "details": "Updated User U005 (SONY)",
      "admin": "SYSTEM"
    },
    {
      "timestamp": "2026-07-07T06:18:00.809Z",
      "module": "SYSTEM",
      "action": "RESTRICTION CHANGE",
      "details": "Updated A6 for U005",
      "admin": "admin"
    },
    {
      "timestamp": "2026-07-07T06:18:01.373Z",
      "module": "SYSTEM",
      "action": "RESTRICTION CHANGE",
      "details": "Updated A2 for U005",
      "admin": "admin"
    },
    {
      "timestamp": "2026-07-07T06:18:01.523Z",
      "module": "SYSTEM",
      "action": "RESTRICTION CHANGE",
      "details": "Updated A4 for U005",
      "admin": "admin"
    },
    {
      "timestamp": "2026-07-07T06:18:02.567Z",
      "module": "USER_MGMT",
      "action": "EDIT USER",
      "details": "Updated User U005 (SONY)",
      "admin": "SYSTEM"
    },
    {
      "timestamp": "2026-07-07T06:18:03.008Z",
      "module": "USER_MGMT",
      "action": "EDIT USER",
      "details": "Updated User U005 (SONY)",
      "admin": "SYSTEM"
    },
    {
      "timestamp": "2026-07-07T06:18:02.932Z",
      "module": "SYSTEM",
      "action": "RESTRICTION CHANGE",
      "details": "Updated A7 for U005",
      "admin": "admin"
    },
    {
      "timestamp": "2026-07-07T06:18:04.601Z",
      "module": "USER_MGMT",
      "action": "EDIT USER",
      "details": "Updated User U005 (SONY)",
      "admin": "SYSTEM"
    },
    {
      "timestamp": "2026-07-07T06:18:04.589Z",
      "module": "SYSTEM",
      "action": "RESTRICTION CHANGE",
      "details": "Updated B for U005",
      "admin": "admin"
    },
    {
      "timestamp": "2026-07-07T06:18:04.643Z",
      "module": "USER_MGMT",
      "action": "EDIT USER",
      "details": "Updated User U005 (SONY)",
      "admin": "SYSTEM"
    },
    {
      "timestamp": "2026-07-07T06:18:05.481Z",
      "module": "USER_MGMT",
      "action": "EDIT USER",
      "details": "Updated User U005 (SONY)",
      "admin": "SYSTEM"
    },
    {
      "timestamp": "2026-07-07T06:18:05.954Z",
      "module": "USER_MGMT",
      "action": "EDIT USER",
      "details": "Updated User U005 (SONY)",
      "admin": "SYSTEM"
    },
    {
      "timestamp": "2026-07-07T06:18:05.880Z",
      "module": "SYSTEM",
      "action": "RESTRICTION CHANGE",
      "details": "Updated C for U005",
      "admin": "admin"
    },
    {
      "timestamp": "2026-07-07T06:18:07.364Z",
      "module": "USER_MGMT",
      "action": "EDIT USER",
      "details": "Updated User U005 (SONY)",
      "admin": "SYSTEM"
    },
    {
      "timestamp": "2026-07-07T06:18:07.319Z",
      "module": "USER_MGMT",
      "action": "EDIT USER",
      "details": "Updated User U005 (SONY)",
      "admin": "SYSTEM"
    },
    {
      "timestamp": "2026-07-07T06:18:07.810Z",
      "module": "SYSTEM",
      "action": "RESTRICTION CHANGE",
      "details": "Updated C1 for U005",
      "admin": "admin"
    },
    {
      "timestamp": "2026-07-07T06:18:08.017Z",
      "module": "SYSTEM",
      "action": "RESTRICTION CHANGE",
      "details": "Updated C3 for U005",
      "admin": "admin"
    },
    {
      "timestamp": "2026-07-07T06:18:08.174Z",
      "module": "USER_MGMT",
      "action": "EDIT USER",
      "details": "Updated User U005 (SONY)",
      "admin": "SYSTEM"
    },
    {
      "timestamp": "2026-07-07T06:18:08.073Z",
      "module": "USER_MGMT",
      "action": "EDIT USER",
      "details": "Updated User U005 (SONY)",
      "admin": "SYSTEM"
    },
    {
      "timestamp": "2026-07-07T06:18:09.361Z",
      "module": "USER_MGMT",
      "action": "EDIT USER",
      "details": "Updated User U005 (SONY)",
      "admin": "SYSTEM"
    },
    {
      "timestamp": "2026-07-07T06:18:10.753Z",
      "module": "SYSTEM",
      "action": "RESTRICTION CHANGE",
      "details": "Updated C7 for U005",
      "admin": "admin"
    },
    {
      "timestamp": "2026-07-07T06:18:12.620Z",
      "module": "SYSTEM",
      "action": "RESTRICTION CHANGE",
      "details": "Updated C4 for U005",
      "admin": "admin"
    },
    {
      "timestamp": "2026-07-07T06:18:13.200Z",
      "module": "SYSTEM",
      "action": "RESTRICTION CHANGE",
      "details": "Updated C4 for U005",
      "admin": "admin"
    },
    {
      "timestamp": "2026-07-07T06:18:13.353Z",
      "module": "SYSTEM",
      "action": "RESTRICTION CHANGE",
      "details": "Updated C3 for U005",
      "admin": "admin"
    },
    {
      "timestamp": "2026-07-07T06:18:14.101Z",
      "module": "SYSTEM",
      "action": "RESTRICTION CHANGE",
      "details": "Updated C9 for U005",
      "admin": "admin"
    },
    {
      "timestamp": "2026-07-07T06:18:13.708Z",
      "module": "SYSTEM",
      "action": "RESTRICTION CHANGE",
      "details": "Updated C5 for U005",
      "admin": "admin"
    },
    {
      "timestamp": "2026-07-07T06:18:15.146Z",
      "module": "SYSTEM",
      "action": "RESTRICTION CHANGE",
      "details": "Updated C9 for U005",
      "admin": "admin"
    },
    {
      "timestamp": "2026-07-07T06:18:13.889Z",
      "module": "USER_MGMT",
      "action": "EDIT USER",
      "details": "Updated User U005 (SONY)",
      "admin": "SYSTEM"
    },
    {
      "timestamp": "2026-07-07T06:18:17.214Z",
      "module": "SYSTEM",
      "action": "RESTRICTION CHANGE",
      "details": "Updated C5 for U005",
      "admin": "admin"
    },
    {
      "timestamp": "2026-07-07T06:18:17.209Z",
      "module": "SYSTEM",
      "action": "RESTRICTION CHANGE",
      "details": "Updated C1 for U005",
      "admin": "admin"
    },
    {
      "timestamp": "2026-07-07T06:18:26.970Z",
      "module": "SYSTEM",
      "action": "RESTRICTION CHANGE",
      "details": "Updated C7 for U005",
      "admin": "admin"
    },
    {
      "timestamp": "2026-07-07T06:20:28.131Z",
      "module": "USER_MGMT",
      "action": "EDIT USER",
      "details": "Updated User U002 (NIMMY)",
      "admin": "SYSTEM"
    },
    {
      "timestamp": "2026-07-07T06:20:42.670Z",
      "module": "SYSTEM",
      "action": "EDIT USER",
      "details": "Updated user U002",
      "admin": "admin"
    },
    {
      "timestamp": "2026-07-07T10:45:55.811Z",
      "module": "USER_MGMT",
      "action": "EDIT USER",
      "details": "Updated User U005 (SONY)",
      "admin": "SYSTEM"
    },
    {
      "timestamp": "2026-07-07T10:45:56.539Z",
      "module": "USER_MGMT",
      "action": "EDIT USER",
      "details": "Updated User U005 (SONY)",
      "admin": "SYSTEM"
    },
    {
      "timestamp": "2026-07-07T10:46:02.171Z",
      "module": "USER_MGMT",
      "action": "EDIT USER",
      "details": "Updated User U005 (SONY)",
      "admin": "SYSTEM"
    },
    {
      "timestamp": "2026-07-07T10:46:02.954Z",
      "module": "SYSTEM",
      "action": "RESTRICTION CHANGE",
      "details": "Updated B for U005",
      "admin": "admin"
    },
    {
      "timestamp": "2026-07-07T10:46:06.039Z",
      "module": "SYSTEM",
      "action": "RESTRICTION CHANGE",
      "details": "Updated B2 for U005",
      "admin": "admin"
    },
    {
      "timestamp": "2026-07-07T10:46:06.635Z",
      "module": "SYSTEM",
      "action": "RESTRICTION CHANGE",
      "details": "Updated C for U005",
      "admin": "admin"
    },
    {
      "timestamp": "2026-07-07T10:46:07.248Z",
      "module": "USER_MGMT",
      "action": "EDIT USER",
      "details": "Updated User U005 (SONY)",
      "admin": "SYSTEM"
    },
    {
      "timestamp": "2026-07-07T10:46:08.683Z",
      "module": "USER_MGMT",
      "action": "EDIT USER",
      "details": "Updated User U005 (SONY)",
      "admin": "SYSTEM"
    },
    {
      "timestamp": "2026-07-07T10:46:09.958Z",
      "module": "USER_MGMT",
      "action": "EDIT USER",
      "details": "Updated User U005 (SONY)",
      "admin": "SYSTEM"
    },
    {
      "timestamp": "2026-07-07T10:46:11.086Z",
      "module": "USER_MGMT",
      "action": "EDIT USER",
      "details": "Updated User U005 (SONY)",
      "admin": "SYSTEM"
    },
    {
      "timestamp": "2026-07-07T10:46:10.859Z",
      "module": "USER_MGMT",
      "action": "EDIT USER",
      "details": "Updated User U005 (SONY)",
      "admin": "SYSTEM"
    },
    {
      "timestamp": "2026-07-07T10:46:11.613Z",
      "module": "USER_MGMT",
      "action": "EDIT USER",
      "details": "Updated User U005 (SONY)",
      "admin": "SYSTEM"
    },
    {
      "timestamp": "2026-07-07T10:46:11.814Z",
      "module": "USER_MGMT",
      "action": "EDIT USER",
      "details": "Updated User U005 (SONY)",
      "admin": "SYSTEM"
    },
    {
      "timestamp": "2026-07-07T10:46:13.031Z",
      "module": "SYSTEM",
      "action": "RESTRICTION CHANGE",
      "details": "Updated B4 for U005",
      "admin": "admin"
    },
    {
      "timestamp": "2026-07-07T10:46:13.171Z",
      "module": "SYSTEM",
      "action": "RESTRICTION CHANGE",
      "details": "Updated B3 for U005",
      "admin": "admin"
    },
    {
      "timestamp": "2026-07-07T10:46:13.798Z",
      "module": "USER_MGMT",
      "action": "EDIT USER",
      "details": "Updated User U005 (SONY)",
      "admin": "SYSTEM"
    },
    {
      "timestamp": "2026-07-07T10:46:14.719Z",
      "module": "USER_MGMT",
      "action": "EDIT USER",
      "details": "Updated User U005 (SONY)",
      "admin": "SYSTEM"
    },
    {
      "timestamp": "2026-07-07T10:46:15.411Z",
      "module": "USER_MGMT",
      "action": "EDIT USER",
      "details": "Updated User U005 (SONY)",
      "admin": "SYSTEM"
    },
    {
      "timestamp": "2026-07-07T10:46:15.686Z",
      "module": "USER_MGMT",
      "action": "EDIT USER",
      "details": "Updated User U005 (SONY)",
      "admin": "SYSTEM"
    },
    {
      "timestamp": "2026-07-07T10:46:16.039Z",
      "module": "USER_MGMT",
      "action": "EDIT USER",
      "details": "Updated User U005 (SONY)",
      "admin": "SYSTEM"
    },
    {
      "timestamp": "2026-07-07T10:46:16.071Z",
      "module": "SYSTEM",
      "action": "RESTRICTION CHANGE",
      "details": "Updated B8 for U005",
      "admin": "admin"
    },
    {
      "timestamp": "2026-07-07T10:46:16.309Z",
      "module": "SYSTEM",
      "action": "RESTRICTION CHANGE",
      "details": "Updated B9 for U005",
      "admin": "admin"
    },
    {
      "timestamp": "2026-07-07T10:46:16.884Z",
      "module": "SYSTEM",
      "action": "RESTRICTION CHANGE",
      "details": "Updated B7 for U005",
      "admin": "admin"
    },
    {
      "timestamp": "2026-07-07T10:46:17.056Z",
      "module": "SYSTEM",
      "action": "RESTRICTION CHANGE",
      "details": "Updated C1 for U005",
      "admin": "admin"
    },
    {
      "timestamp": "2026-07-07T10:46:17.409Z",
      "module": "SYSTEM",
      "action": "RESTRICTION CHANGE",
      "details": "Updated B5 for U005",
      "admin": "admin"
    },
    {
      "timestamp": "2026-07-07T10:46:19.403Z",
      "module": "SYSTEM",
      "action": "RESTRICTION CHANGE",
      "details": "Updated C5 for U005",
      "admin": "admin"
    },
    {
      "timestamp": "2026-07-07T10:46:19.363Z",
      "module": "SYSTEM",
      "action": "RESTRICTION CHANGE",
      "details": "Updated C3 for U005",
      "admin": "admin"
    },
    {
      "timestamp": "2026-07-07T10:46:20.317Z",
      "module": "SYSTEM",
      "action": "RESTRICTION CHANGE",
      "details": "Updated C7 for U005",
      "admin": "admin"
    },
    {
      "timestamp": "2026-07-07T10:46:21.518Z",
      "module": "SYSTEM",
      "action": "RESTRICTION CHANGE",
      "details": "Updated C4 for U005",
      "admin": "admin"
    },
    {
      "timestamp": "2026-07-07T12:00:35.452Z",
      "module": "USER_MGMT",
      "action": "EDIT USER",
      "details": "Updated User U005 (SONY)",
      "admin": "SYSTEM"
    },
    {
      "timestamp": "2026-07-07T12:00:35.420Z",
      "module": "USER_MGMT",
      "action": "EDIT USER",
      "details": "Updated User U005 (SONY)",
      "admin": "SYSTEM"
    },
    {
      "timestamp": "2026-07-07T12:00:35.864Z",
      "module": "USER_MGMT",
      "action": "EDIT USER",
      "details": "Updated User U005 (SONY)",
      "admin": "SYSTEM"
    },
    {
      "timestamp": "2026-07-07T12:00:36.384Z",
      "module": "USER_MGMT",
      "action": "EDIT USER",
      "details": "Updated User U005 (SONY)",
      "admin": "SYSTEM"
    },
    {
      "timestamp": "2026-07-07T12:00:36.548Z",
      "module": "USER_MGMT",
      "action": "EDIT USER",
      "details": "Updated User U005 (SONY)",
      "admin": "SYSTEM"
    },
    {
      "timestamp": "2026-07-07T12:00:37.613Z",
      "module": "USER_MGMT",
      "action": "EDIT USER",
      "details": "Updated User U005 (SONY)",
      "admin": "SYSTEM"
    },
    {
      "timestamp": "2026-07-07T12:00:38.311Z",
      "module": "USER_MGMT",
      "action": "EDIT USER",
      "details": "Updated User U005 (SONY)",
      "admin": "SYSTEM"
    },
    {
      "timestamp": "2026-07-07T12:00:38.697Z",
      "module": "USER_MGMT",
      "action": "EDIT USER",
      "details": "Updated User U005 (SONY)",
      "admin": "SYSTEM"
    },
    {
      "timestamp": "2026-07-07T12:00:39.308Z",
      "module": "USER_MGMT",
      "action": "EDIT USER",
      "details": "Updated User U005 (SONY)",
      "admin": "SYSTEM"
    },
    {
      "timestamp": "2026-07-07T12:00:40.195Z",
      "module": "USER_MGMT",
      "action": "EDIT USER",
      "details": "Updated User U005 (SONY)",
      "admin": "SYSTEM"
    },
    {
      "timestamp": "2026-07-07T12:00:40.500Z",
      "module": "USER_MGMT",
      "action": "EDIT USER",
      "details": "Updated User U005 (SONY)",
      "admin": "SYSTEM"
    },
    {
      "timestamp": "2026-07-07T12:00:40.623Z",
      "module": "SYSTEM",
      "action": "RESTRICTION CHANGE",
      "details": "Updated A3 for U005",
      "admin": "admin"
    },
    {
      "timestamp": "2026-07-07T12:00:40.922Z",
      "module": "SYSTEM",
      "action": "RESTRICTION CHANGE",
      "details": "Updated A5 for U005",
      "admin": "admin"
    },
    {
      "timestamp": "2026-07-07T12:00:41.313Z",
      "module": "SYSTEM",
      "action": "RESTRICTION CHANGE",
      "details": "Updated A4 for U005",
      "admin": "admin"
    },
    {
      "timestamp": "2026-07-07T12:00:41.662Z",
      "module": "USER_MGMT",
      "action": "EDIT USER",
      "details": "Updated User U005 (SONY)",
      "admin": "SYSTEM"
    },
    {
      "timestamp": "2026-07-07T12:00:41.736Z",
      "module": "SYSTEM",
      "action": "RESTRICTION CHANGE",
      "details": "Updated B2 for U005",
      "admin": "admin"
    },
    {
      "timestamp": "2026-07-07T12:00:42.078Z",
      "module": "USER_MGMT",
      "action": "EDIT USER",
      "details": "Updated User U005 (SONY)",
      "admin": "SYSTEM"
    },
    {
      "timestamp": "2026-07-07T12:00:42.725Z",
      "module": "USER_MGMT",
      "action": "EDIT USER",
      "details": "Updated User U005 (SONY)",
      "admin": "SYSTEM"
    },
    {
      "timestamp": "2026-07-07T12:00:42.702Z",
      "module": "USER_MGMT",
      "action": "EDIT USER",
      "details": "Updated User U005 (SONY)",
      "admin": "SYSTEM"
    },
    {
      "timestamp": "2026-07-07T12:00:43.185Z",
      "module": "SYSTEM",
      "action": "RESTRICTION CHANGE",
      "details": "Updated A2 for U005",
      "admin": "admin"
    },
    {
      "timestamp": "2026-07-07T12:00:42.883Z",
      "module": "SYSTEM",
      "action": "RESTRICTION CHANGE",
      "details": "Updated A6 for U005",
      "admin": "admin"
    },
    {
      "timestamp": "2026-07-07T12:00:44.314Z",
      "module": "USER_MGMT",
      "action": "EDIT USER",
      "details": "Updated User U005 (SONY)",
      "admin": "SYSTEM"
    },
    {
      "timestamp": "2026-07-07T12:00:44.894Z",
      "module": "SYSTEM",
      "action": "RESTRICTION CHANGE",
      "details": "Updated B4 for U005",
      "admin": "admin"
    },
    {
      "timestamp": "2026-07-07T12:00:45.457Z",
      "module": "SYSTEM",
      "action": "RESTRICTION CHANGE",
      "details": "Updated B5 for U005",
      "admin": "admin"
    },
    {
      "timestamp": "2026-07-07T12:00:46.189Z",
      "module": "SYSTEM",
      "action": "RESTRICTION CHANGE",
      "details": "Updated A7 for U005",
      "admin": "admin"
    },
    {
      "timestamp": "2026-07-07T12:00:46.696Z",
      "module": "SYSTEM",
      "action": "RESTRICTION CHANGE",
      "details": "Updated B3 for U005",
      "admin": "admin"
    },
    {
      "timestamp": "2026-07-07T12:00:46.966Z",
      "module": "SYSTEM",
      "action": "RESTRICTION CHANGE",
      "details": "Updated B7 for U005",
      "admin": "admin"
    },
    {
      "timestamp": "2026-07-07T12:00:47.881Z",
      "module": "SYSTEM",
      "action": "RESTRICTION CHANGE",
      "details": "Updated B9 for U005",
      "admin": "admin"
    },
    {
      "timestamp": "2026-07-07T12:00:48.371Z",
      "module": "SYSTEM",
      "action": "RESTRICTION CHANGE",
      "details": "Updated B8 for U005",
      "admin": "admin"
    },
    {
      "timestamp": "2026-07-07T12:00:49.121Z",
      "module": "SYSTEM",
      "action": "RESTRICTION CHANGE",
      "details": "Updated B9 for U005",
      "admin": "admin"
    },
    {
      "timestamp": "2026-07-07T12:00:49.555Z",
      "module": "SYSTEM",
      "action": "RESTRICTION CHANGE",
      "details": "Updated B6 for U005",
      "admin": "admin"
    },
    {
      "timestamp": "2026-07-07T12:00:52.150Z",
      "module": "SYSTEM",
      "action": "RESTRICTION CHANGE",
      "details": "Updated B9 for U005",
      "admin": "admin"
    },
    {
      "timestamp": "2026-07-09T07:56:26.175Z",
      "module": "USER_MGMT",
      "action": "EDIT USER",
      "details": "Updated User U005 (SONY)",
      "admin": "SYSTEM"
    },
    {
      "timestamp": "2026-07-09T07:56:31.134Z",
      "module": "SYSTEM",
      "action": "RESTRICTION CHANGE",
      "details": "Updated DOWNLOAD_RESTRICTION for U005",
      "admin": "admin"
    },
    {
      "timestamp": "2026-07-10T10:03:14.130Z",
      "module": "USER_MGMT",
      "action": "EDIT USER",
      "details": "Updated User U003 (ADITHYA)",
      "admin": "SYSTEM"
    },
    {
      "timestamp": "2026-07-10T10:03:19.630Z",
      "module": "SYSTEM",
      "action": "EDIT USER",
      "details": "Updated user U003",
      "admin": "admin"
    },
    {
      "timestamp": "2026-07-10T10:03:37.538Z",
      "module": "USER_MGMT",
      "action": "EDIT USER",
      "details": "Updated User U003 (ADITHYA)",
      "admin": "SYSTEM"
    },
    {
      "timestamp": "2026-07-10T10:03:42.514Z",
      "module": "SYSTEM",
      "action": "EDIT USER",
      "details": "Updated user U003",
      "admin": "admin"
    },
    {
      "timestamp": "2026-07-10T11:46:58.253Z",
      "module": "USER_MGMT",
      "action": "SAVE_USERS",
      "details": "Saved record to USERS",
      "admin": "SYSTEM"
    },
    {
      "timestamp": "2026-07-10T11:47:09.201Z",
      "module": "SYSTEM",
      "action": "ADD USER",
      "details": "Created user U006 (common)",
      "admin": "admin"
    },
    {
      "timestamp": "2026-07-10T11:49:15.728Z",
      "module": "USER_MGMT",
      "action": "EDIT USER",
      "details": "Updated User U003 (ADITHYA)",
      "admin": "SYSTEM"
    },
    {
      "timestamp": "2026-07-10T11:49:25.158Z",
      "module": "SYSTEM",
      "action": "EDIT USER",
      "details": "Updated user U003",
      "admin": "admin"
    },
    {
      "timestamp": "2026-07-11T08:24:42.685Z",
      "module": "USER_MGMT",
      "action": "SAVE_USERS",
      "details": "Saved record to USERS",
      "admin": "SYSTEM"
    },
    {
      "timestamp": "2026-07-11T08:24:52.948Z",
      "module": "SYSTEM",
      "action": "ADD USER",
      "details": "Created user U007 (ADITHYA S MENON)",
      "admin": "admin"
    },
    {
      "timestamp": "2026-07-11T08:25:53.828Z",
      "module": "USER_MGMT",
      "action": "EDIT USER",
      "details": "Updated User U002 (NIMMY)",
      "admin": "SYSTEM"
    },
    {
      "timestamp": "2026-07-11T08:26:01.771Z",
      "module": "SYSTEM",
      "action": "EDIT USER",
      "details": "Updated user U002",
      "admin": "admin"
    },
    {
      "timestamp": "2026-07-11T08:26:16.779Z",
      "module": "USER_MGMT",
      "action": "EDIT USER",
      "details": "Updated User U002 (NIMMY)",
      "admin": "SYSTEM"
    },
    {
      "timestamp": "2026-07-11T08:26:25.915Z",
      "module": "SYSTEM",
      "action": "EDIT USER",
      "details": "Updated user U002",
      "admin": "admin"
    },
    {
      "timestamp": "2026-07-11T10:25:31.800Z",
      "module": "USER_MGMT",
      "action": "EDIT USER",
      "details": "Updated User U003 (ADITHYA)",
      "admin": "SYSTEM"
    },
    {
      "timestamp": "2026-07-11T10:25:38.362Z",
      "module": "SETTINGS",
      "action": "UPDATE_SETTINGS",
      "details": "Updated Settings for U003: Dropdown Update",
      "admin": "SYSTEM"
    },
    {
      "timestamp": "2026-07-11T10:25:41.111Z",
      "module": "SYSTEM",
      "action": "DROPDOWN SETTINGS",
      "details": "Updated settings for U003",
      "admin": "admin"
    },
    {
      "timestamp": "2026-07-11T11:32:59.156Z",
      "module": "USER_MGMT",
      "action": "EDIT USER",
      "details": "Updated User U006 (COMMON)",
      "admin": "SYSTEM"
    },
    {
      "timestamp": "2026-07-11T11:33:04.879Z",
      "module": "SYSTEM",
      "action": "EDIT USER",
      "details": "Updated user U006",
      "admin": "admin"
    },
    {
      "timestamp": "2026-07-17T09:54:48.837Z",
      "module": "USER_MGMT",
      "action": "SAVE_USERS",
      "details": "Saved record to USERS",
      "admin": "SYSTEM"
    },
    {
      "timestamp": "2026-07-17T09:55:01.901Z",
      "module": "SYSTEM",
      "action": "ADD USER",
      "details": "Created user U008 (arundhathi)",
      "admin": "admin"
    },
    {
      "timestamp": "2026-07-18T06:12:36.697Z",
      "module": "USER_MGMT",
      "action": "EDIT USER",
      "details": "Updated User U003 (ADITHYA)",
      "admin": "SYSTEM"
    },
    {
      "timestamp": "2026-07-18T06:12:38.934Z",
      "module": "USER_MGMT",
      "action": "EDIT USER",
      "details": "Updated User U003 (ADITHYA)",
      "admin": "SYSTEM"
    },
    {
      "timestamp": "2026-07-18T06:12:38.418Z",
      "module": "USER_MGMT",
      "action": "EDIT USER",
      "details": "Updated User U003 (ADITHYA)",
      "admin": "SYSTEM"
    },
    {
      "timestamp": "2026-07-18T06:12:44.730Z",
      "module": "SYSTEM",
      "action": "RESTRICTION CHANGE",
      "details": "Updated A3 for U003",
      "admin": "admin"
    },
    {
      "timestamp": "2026-07-18T06:12:45.411Z",
      "module": "SYSTEM",
      "action": "RESTRICTION CHANGE",
      "details": "Updated A2 for U003",
      "admin": "admin"
    },
    {
      "timestamp": "2026-07-18T06:12:46.941Z",
      "module": "SYSTEM",
      "action": "RESTRICTION CHANGE",
      "details": "Updated A2 for U003",
      "admin": "admin"
    },
    {
      "timestamp": "2026-07-18T06:21:33.772Z",
      "module": "USER_MGMT",
      "action": "EDIT USER",
      "details": "Updated User U003 (ADITHYA)",
      "admin": "SYSTEM"
    },
    {
      "timestamp": "2026-07-18T06:21:34.699Z",
      "module": "USER_MGMT",
      "action": "EDIT USER",
      "details": "Updated User U003 (ADITHYA)",
      "admin": "SYSTEM"
    },
    {
      "timestamp": "2026-07-18T06:21:40.388Z",
      "module": "SYSTEM",
      "action": "RESTRICTION CHANGE",
      "details": "Updated A2 for U003",
      "admin": "admin"
    },
    {
      "timestamp": "2026-07-18T06:21:42.510Z",
      "module": "SYSTEM",
      "action": "RESTRICTION CHANGE",
      "details": "Updated A3 for U003",
      "admin": "admin"
    },
    {
      "timestamp": "2026-07-18T06:22:32.671Z",
      "module": "USER_MGMT",
      "action": "EDIT USER",
      "details": "Updated User U003 (ADITHYA)",
      "admin": "SYSTEM"
    },
    {
      "timestamp": "2026-07-18T06:22:38.699Z",
      "module": "SYSTEM",
      "action": "RESTRICTION CHANGE",
      "details": "Updated A3 for U003",
      "admin": "admin"
    },
    {
      "timestamp": "2026-07-18T09:32:15.489Z",
      "module": "USER_MGMT",
      "action": "EDIT USER",
      "details": "Updated User A001 (admin)",
      "admin": "SYSTEM"
    },
    {
      "timestamp": "2026-07-18T09:32:25.078Z",
      "module": "SYSTEM",
      "action": "EDIT USER",
      "details": "Updated user A001",
      "admin": "admin"
    },
    {
      "timestamp": "2026-07-18T09:32:46.695Z",
      "module": "USER_MGMT",
      "action": "DELETE USER",
      "details": "Deleted User W001. Reason: not in use",
      "admin": "admin"
    },
    {
      "timestamp": "2026-07-18T09:32:52.216Z",
      "module": "SYSTEM",
      "action": "DELETE USER",
      "details": "Deleted user W001. Reason: not in use",
      "admin": "admin"
    },
    {
      "timestamp": "2026-07-18T09:33:39.123Z",
      "module": "USER_MGMT",
      "action": "DELETE USER",
      "details": "Deleted User U001. Reason: not in use",
      "admin": "admin"
    },
    {
      "timestamp": "2026-07-18T09:33:45.494Z",
      "module": "SYSTEM",
      "action": "DELETE USER",
      "details": "Deleted user U001. Reason: not in use",
      "admin": "admin"
    },
    {
      "timestamp": "2026-07-18T09:34:27.375Z",
      "module": "USER_MGMT",
      "action": "EDIT USER",
      "details": "Updated User U004 (VISHNUKUMAR)",
      "admin": "SYSTEM"
    },
    {
      "timestamp": "2026-07-18T09:34:35.303Z",
      "module": "SYSTEM",
      "action": "EDIT USER",
      "details": "Updated user U004",
      "admin": "admin"
    },
    {
      "timestamp": "2026-07-18T09:35:02.332Z",
      "module": "USER_MGMT",
      "action": "EDIT USER",
      "details": "Updated User A001 (ADMIN)",
      "admin": "SYSTEM"
    },
    {
      "timestamp": "2026-07-18T09:35:15.176Z",
      "module": "SYSTEM",
      "action": "EDIT USER",
      "details": "Updated user A001",
      "admin": "ADMIN"
    },
    {
      "timestamp": "2026-07-18T09:40:17.168Z",
      "module": "USER_MGMT",
      "action": "DELETE USER",
      "details": "Deleted User U008. Reason: not in use",
      "admin": "ADMIN"
    },
    {
      "timestamp": "2026-07-18T09:40:23.792Z",
      "module": "SYSTEM",
      "action": "DELETE USER",
      "details": "Deleted user U008. Reason: not in use",
      "admin": "ADMIN"
    },
    {
      "timestamp": "2026-07-18T09:40:42.039Z",
      "module": "USER_MGMT",
      "action": "DELETE USER",
      "details": "Deleted User U006. Reason: not in use",
      "admin": "ADMIN"
    },
    {
      "timestamp": "2026-07-18T09:40:47.138Z",
      "module": "SYSTEM",
      "action": "DELETE USER",
      "details": "Deleted user U006. Reason: not in use",
      "admin": "ADMIN"
    },
    {
      "timestamp": "2026-07-18T09:41:18.584Z",
      "module": "USER_MGMT",
      "action": "EDIT USER",
      "details": "Updated User A001 (ADMIN)",
      "admin": "SYSTEM"
    },
    {
      "timestamp": "2026-07-18T09:41:27.010Z",
      "module": "SYSTEM",
      "action": "EDIT USER",
      "details": "Updated user A001",
      "admin": "ADMIN"
    },
    {
      "timestamp": "2026-07-18T09:42:39.992Z",
      "module": "USER_MGMT",
      "action": "EDIT USER",
      "details": "Updated User A001 (ADMIN)",
      "admin": "SYSTEM"
    },
    {
      "timestamp": "2026-07-18T09:42:52.208Z",
      "module": "SYSTEM",
      "action": "EDIT USER",
      "details": "Updated user A001",
      "admin": "ADMIN"
    },
    {
      "timestamp": "2026-07-18T09:48:13.861Z",
      "module": "USER_MGMT",
      "action": "EDIT USER",
      "details": "Updated User A001 (ADMIN)",
      "admin": "SYSTEM"
    },
    {
      "timestamp": "2026-07-18T09:48:25.817Z",
      "module": "SYSTEM",
      "action": "EDIT USER",
      "details": "Updated user A001",
      "admin": "ADMIN"
    },
    {
      "timestamp": "2026-07-18T09:49:49.493Z",
      "module": "USER_MGMT",
      "action": "EDIT USER",
      "details": "Updated User A001 (ADMIN)",
      "admin": "SYSTEM"
    },
    {
      "timestamp": "2026-07-18T09:49:59.442Z",
      "module": "SYSTEM",
      "action": "EDIT USER",
      "details": "Updated user A001",
      "admin": "ADMIN"
    },
    {
      "timestamp": "2026-07-18T09:50:53.906Z",
      "module": "USER_MGMT",
      "action": "EDIT USER",
      "details": "Updated User U007 (ADITHYA S MENON)",
      "admin": "SYSTEM"
    },
    {
      "timestamp": "2026-07-18T09:51:01.925Z",
      "module": "SYSTEM",
      "action": "EDIT USER",
      "details": "Updated user U007",
      "admin": "ADMIN"
    },
    {
      "timestamp": "2026-07-18T09:51:56.406Z",
      "module": "USER_MGMT",
      "action": "EDIT USER",
      "details": "Updated User A001 (ADMIN)",
      "admin": "SYSTEM"
    },
    {
      "timestamp": "2026-07-18T09:52:06.260Z",
      "module": "SYSTEM",
      "action": "EDIT USER",
      "details": "Updated user A001",
      "admin": "ADMIN"
    },
    {
      "timestamp": "2026-07-18T09:53:38.270Z",
      "module": "USER_MGMT",
      "action": "SAVE_USERS",
      "details": "Saved record to USERS",
      "admin": "SYSTEM"
    },
    {
      "timestamp": "2026-07-18T09:53:52.195Z",
      "module": "SYSTEM",
      "action": "ADD USER",
      "details": "Created user U008 (SONY LENIN)",
      "admin": "ADMIN"
    },
    {
      "timestamp": "2026-07-18T10:08:17.973Z",
      "module": "USER_MGMT",
      "action": "EDIT USER",
      "details": "Updated User A001 (ADMIN)",
      "admin": "SYSTEM"
    },
    {
      "timestamp": "2026-07-18T10:08:23.184Z",
      "module": "SETTINGS",
      "action": "UPDATE_SETTINGS",
      "details": "Updated Settings for A001: Dropdown Update",
      "admin": "SYSTEM"
    },
    {
      "timestamp": "2026-07-18T10:08:25.923Z",
      "module": "SYSTEM",
      "action": "DROPDOWN SETTINGS",
      "details": "Updated settings for A001",
      "admin": "ADITHYA S MENON"
    },
    {
      "timestamp": "2026-07-18T10:10:35.049Z",
      "module": "USER_MGMT",
      "action": "EDIT USER",
      "details": "Updated User A001 (ADMIN)",
      "admin": "SYSTEM"
    },
    {
      "timestamp": "2026-07-18T10:10:40.867Z",
      "module": "SETTINGS",
      "action": "UPDATE_SETTINGS",
      "details": "Updated Settings for A001: Dropdown Update",
      "admin": "SYSTEM"
    },
    {
      "timestamp": "2026-07-18T10:10:43.939Z",
      "module": "SYSTEM",
      "action": "DROPDOWN SETTINGS",
      "details": "Updated settings for A001",
      "admin": "ADITHYA S MENON"
    },
    {
      "timestamp": "2026-07-18T10:11:17.034Z",
      "module": "USER_MGMT",
      "action": "EDIT USER",
      "details": "Updated User U008 (SONY LENIN)",
      "admin": "SYSTEM"
    },
    {
      "timestamp": "2026-07-18T10:11:18.533Z",
      "module": "USER_MGMT",
      "action": "EDIT USER",
      "details": "Updated User U008 (SONY LENIN)",
      "admin": "SYSTEM"
    },
    {
      "timestamp": "2026-07-18T10:11:19.207Z",
      "module": "USER_MGMT",
      "action": "EDIT USER",
      "details": "Updated User U008 (SONY LENIN)",
      "admin": "SYSTEM"
    },
    {
      "timestamp": "2026-07-18T10:11:20.373Z",
      "module": "USER_MGMT",
      "action": "EDIT USER",
      "details": "Updated User U008 (SONY LENIN)",
      "admin": "SYSTEM"
    },
    {
      "timestamp": "2026-07-18T10:11:20.433Z",
      "module": "USER_MGMT",
      "action": "EDIT USER",
      "details": "Updated User U008 (SONY LENIN)",
      "admin": "SYSTEM"
    },
    {
      "timestamp": "2026-07-18T10:11:20.496Z",
      "module": "USER_MGMT",
      "action": "EDIT USER",
      "details": "Updated User U008 (SONY LENIN)",
      "admin": "SYSTEM"
    },
    {
      "timestamp": "2026-07-18T10:11:21.455Z",
      "module": "USER_MGMT",
      "action": "EDIT USER",
      "details": "Updated User U008 (SONY LENIN)",
      "admin": "SYSTEM"
    },
    {
      "timestamp": "2026-07-18T10:11:21.526Z",
      "module": "USER_MGMT",
      "action": "EDIT USER",
      "details": "Updated User U008 (SONY LENIN)",
      "admin": "SYSTEM"
    },
    {
      "timestamp": "2026-07-18T10:11:21.981Z",
      "module": "SYSTEM",
      "action": "RESTRICTION CHANGE",
      "details": "Updated C for U008",
      "admin": "ADITHYA S MENON"
    },
    {
      "timestamp": "2026-07-18T10:11:22.878Z",
      "module": "USER_MGMT",
      "action": "EDIT USER",
      "details": "Updated User U008 (SONY LENIN)",
      "admin": "SYSTEM"
    },
    {
      "timestamp": "2026-07-18T10:11:23.910Z",
      "module": "USER_MGMT",
      "action": "EDIT USER",
      "details": "Updated User U008 (SONY LENIN)",
      "admin": "SYSTEM"
    },
    {
      "timestamp": "2026-07-18T10:11:24.397Z",
      "module": "USER_MGMT",
      "action": "EDIT USER",
      "details": "Updated User U008 (SONY LENIN)",
      "admin": "SYSTEM"
    },
    {
      "timestamp": "2026-07-18T10:11:24.862Z",
      "module": "USER_MGMT",
      "action": "EDIT USER",
      "details": "Updated User U008 (SONY LENIN)",
      "admin": "SYSTEM"
    },
    {
      "timestamp": "2026-07-18T10:11:24.321Z",
      "module": "SYSTEM",
      "action": "RESTRICTION CHANGE",
      "details": "Updated C2 for U008",
      "admin": "ADITHYA S MENON"
    },
    {
      "timestamp": "2026-07-18T10:11:25.808Z",
      "module": "SYSTEM",
      "action": "RESTRICTION CHANGE",
      "details": "Updated C1 for U008",
      "admin": "ADITHYA S MENON"
    },
    {
      "timestamp": "2026-07-18T10:11:26.059Z",
      "module": "USER_MGMT",
      "action": "EDIT USER",
      "details": "Updated User U008 (SONY LENIN)",
      "admin": "SYSTEM"
    },
    {
      "timestamp": "2026-07-18T10:11:26.657Z",
      "module": "SYSTEM",
      "action": "RESTRICTION CHANGE",
      "details": "Updated C4 for U008",
      "admin": "ADITHYA S MENON"
    },
    {
      "timestamp": "2026-07-18T10:11:27.150Z",
      "module": "SYSTEM",
      "action": "RESTRICTION CHANGE",
      "details": "Updated C5 for U008",
      "admin": "ADITHYA S MENON"
    },
    {
      "timestamp": "2026-07-18T10:11:27.353Z",
      "module": "SYSTEM",
      "action": "RESTRICTION CHANGE",
      "details": "Updated C6 for U008",
      "admin": "ADITHYA S MENON"
    },
    {
      "timestamp": "2026-07-18T10:11:27.436Z",
      "module": "SYSTEM",
      "action": "RESTRICTION CHANGE",
      "details": "Updated C7 for U008",
      "admin": "ADITHYA S MENON"
    },
    {
      "timestamp": "2026-07-18T10:11:27.620Z",
      "module": "USER_MGMT",
      "action": "EDIT USER",
      "details": "Updated User U008 (SONY LENIN)",
      "admin": "SYSTEM"
    },
    {
      "timestamp": "2026-07-18T10:11:28.580Z",
      "module": "USER_MGMT",
      "action": "EDIT USER",
      "details": "Updated User U008 (SONY LENIN)",
      "admin": "SYSTEM"
    },
    {
      "timestamp": "2026-07-18T10:11:29.297Z",
      "module": "USER_MGMT",
      "action": "EDIT USER",
      "details": "Updated User U008 (SONY LENIN)",
      "admin": "SYSTEM"
    },
    {
      "timestamp": "2026-07-18T10:11:29.140Z",
      "module": "SYSTEM",
      "action": "RESTRICTION CHANGE",
      "details": "Updated C for U008",
      "admin": "ADITHYA S MENON"
    },
    {
      "timestamp": "2026-07-18T10:11:29.517Z",
      "module": "SYSTEM",
      "action": "RESTRICTION CHANGE",
      "details": "Updated C2 for U008",
      "admin": "ADITHYA S MENON"
    },
    {
      "timestamp": "2026-07-18T10:11:29.590Z",
      "module": "SYSTEM",
      "action": "RESTRICTION CHANGE",
      "details": "Updated C3 for U008",
      "admin": "ADITHYA S MENON"
    },
    {
      "timestamp": "2026-07-18T10:11:30.741Z",
      "module": "USER_MGMT",
      "action": "EDIT USER",
      "details": "Updated User U008 (SONY LENIN)",
      "admin": "SYSTEM"
    },
    {
      "timestamp": "2026-07-18T10:11:31.132Z",
      "module": "USER_MGMT",
      "action": "EDIT USER",
      "details": "Updated User U008 (SONY LENIN)",
      "admin": "SYSTEM"
    },
    {
      "timestamp": "2026-07-18T10:11:31.302Z",
      "module": "SYSTEM",
      "action": "RESTRICTION CHANGE",
      "details": "Updated C3 for U008",
      "admin": "ADITHYA S MENON"
    },
    {
      "timestamp": "2026-07-18T10:11:33.118Z",
      "module": "USER_MGMT",
      "action": "EDIT USER",
      "details": "Updated User U008 (SONY LENIN)",
      "admin": "SYSTEM"
    },
    {
      "timestamp": "2026-07-18T10:11:33.137Z",
      "module": "USER_MGMT",
      "action": "EDIT USER",
      "details": "Updated User U008 (SONY LENIN)",
      "admin": "SYSTEM"
    },
    {
      "timestamp": "2026-07-18T10:11:33.760Z",
      "module": "USER_MGMT",
      "action": "EDIT USER",
      "details": "Updated User U008 (SONY LENIN)",
      "admin": "SYSTEM"
    },
    {
      "timestamp": "2026-07-18T10:11:33.382Z",
      "module": "SYSTEM",
      "action": "RESTRICTION CHANGE",
      "details": "Updated C1 for U008",
      "admin": "ADITHYA S MENON"
    },
    {
      "timestamp": "2026-07-18T10:11:34.140Z",
      "module": "USER_MGMT",
      "action": "EDIT USER",
      "details": "Updated User U008 (SONY LENIN)",
      "admin": "SYSTEM"
    },
    {
      "timestamp": "2026-07-18T10:11:34.981Z",
      "module": "SYSTEM",
      "action": "RESTRICTION CHANGE",
      "details": "Updated C4 for U008",
      "admin": "ADITHYA S MENON"
    },
    {
      "timestamp": "2026-07-18T10:11:36.149Z",
      "module": "USER_MGMT",
      "action": "EDIT USER",
      "details": "Updated User U008 (SONY LENIN)",
      "admin": "SYSTEM"
    },
    {
      "timestamp": "2026-07-18T10:11:36.155Z",
      "module": "SYSTEM",
      "action": "RESTRICTION CHANGE",
      "details": "Updated B1 for U008",
      "admin": "ADITHYA S MENON"
    },
    {
      "timestamp": "2026-07-18T10:11:36.919Z",
      "module": "USER_MGMT",
      "action": "EDIT USER",
      "details": "Updated User U008 (SONY LENIN)",
      "admin": "SYSTEM"
    },
    {
      "timestamp": "2026-07-18T10:11:36.467Z",
      "module": "SYSTEM",
      "action": "RESTRICTION CHANGE",
      "details": "Updated B for U008",
      "admin": "ADITHYA S MENON"
    },
    {
      "timestamp": "2026-07-18T10:11:37.049Z",
      "module": "USER_MGMT",
      "action": "EDIT USER",
      "details": "Updated User U008 (SONY LENIN)",
      "admin": "SYSTEM"
    },
    {
      "timestamp": "2026-07-18T10:11:37.480Z",
      "module": "SYSTEM",
      "action": "RESTRICTION CHANGE",
      "details": "Updated B3 for U008",
      "admin": "ADITHYA S MENON"
    },
    {
      "timestamp": "2026-07-18T10:11:38.739Z",
      "module": "USER_MGMT",
      "action": "EDIT USER",
      "details": "Updated User U008 (SONY LENIN)",
      "admin": "SYSTEM"
    },
    {
      "timestamp": "2026-07-18T10:11:38.428Z",
      "module": "SYSTEM",
      "action": "RESTRICTION CHANGE",
      "details": "Updated C5 for U008",
      "admin": "ADITHYA S MENON"
    },
    {
      "timestamp": "2026-07-18T10:11:38.271Z",
      "module": "SYSTEM",
      "action": "RESTRICTION CHANGE",
      "details": "Updated B2 for U008",
      "admin": "ADITHYA S MENON"
    },
    {
      "timestamp": "2026-07-18T10:11:40.511Z",
      "module": "USER_MGMT",
      "action": "EDIT USER",
      "details": "Updated User U008 (SONY LENIN)",
      "admin": "SYSTEM"
    },
    {
      "timestamp": "2026-07-18T10:11:40.440Z",
      "module": "USER_MGMT",
      "action": "EDIT USER",
      "details": "Updated User U008 (SONY LENIN)",
      "admin": "SYSTEM"
    },
    {
      "timestamp": "2026-07-18T10:11:39.054Z",
      "module": "SYSTEM",
      "action": "RESTRICTION CHANGE",
      "details": "Updated B8 for U008",
      "admin": "ADITHYA S MENON"
    },
    {
      "timestamp": "2026-07-18T10:11:45.895Z",
      "module": "SYSTEM",
      "action": "RESTRICTION CHANGE",
      "details": "Updated B7 for U008",
      "admin": "ADITHYA S MENON"
    },
    {
      "timestamp": "2026-07-18T10:11:46.228Z",
      "module": "SYSTEM",
      "action": "RESTRICTION CHANGE",
      "details": "Updated B2 for U008",
      "admin": "ADITHYA S MENON"
    },
    {
      "timestamp": "2026-07-18T10:11:47.200Z",
      "module": "SYSTEM",
      "action": "RESTRICTION CHANGE",
      "details": "Updated C5 for U008",
      "admin": "ADITHYA S MENON"
    },
    {
      "timestamp": "2026-07-18T10:11:47.287Z",
      "module": "SYSTEM",
      "action": "RESTRICTION CHANGE",
      "details": "Updated B5 for U008",
      "admin": "ADITHYA S MENON"
    },
    {
      "timestamp": "2026-07-18T10:11:47.426Z",
      "module": "SYSTEM",
      "action": "RESTRICTION CHANGE",
      "details": "Updated C4 for U008",
      "admin": "ADITHYA S MENON"
    },
    {
      "timestamp": "2026-07-18T10:11:47.317Z",
      "module": "SYSTEM",
      "action": "RESTRICTION CHANGE",
      "details": "Updated B9 for U008",
      "admin": "ADITHYA S MENON"
    },
    {
      "timestamp": "2026-07-18T10:11:47.612Z",
      "module": "SYSTEM",
      "action": "RESTRICTION CHANGE",
      "details": "Updated B1 for U008",
      "admin": "ADITHYA S MENON"
    },
    {
      "timestamp": "2026-07-18T10:11:48.961Z",
      "module": "SYSTEM",
      "action": "RESTRICTION CHANGE",
      "details": "Updated B for U008",
      "admin": "ADITHYA S MENON"
    },
    {
      "timestamp": "2026-07-18T10:11:49.436Z",
      "module": "SYSTEM",
      "action": "RESTRICTION CHANGE",
      "details": "Updated B3 for U008",
      "admin": "ADITHYA S MENON"
    },
    {
      "timestamp": "2026-07-18T10:12:58.681Z",
      "module": "USER_MGMT",
      "action": "DELETE USER",
      "details": "Deleted User U003. Reason: not in use",
      "admin": "ADMIN"
    },
    {
      "timestamp": "2026-07-18T10:13:07.059Z",
      "module": "SYSTEM",
      "action": "DELETE USER",
      "details": "Deleted user U003. Reason: not in use",
      "admin": "ADMIN"
    },
    {
      "timestamp": "2026-07-18T10:13:27.356Z",
      "module": "USER_MGMT",
      "action": "DELETE USER",
      "details": "Deleted User U005. Reason: not in use",
      "admin": "ADMIN"
    },
    {
      "timestamp": "2026-07-18T10:13:34.790Z",
      "module": "SYSTEM",
      "action": "DELETE USER",
      "details": "Deleted user U005. Reason: not in use",
      "admin": "ADMIN"
    },
    {
      "timestamp": "2026-07-18T10:13:50.317Z",
      "module": "USER_MGMT",
      "action": "DELETE USER",
      "details": "Deleted User U004. Reason: not in use",
      "admin": "ADMIN"
    },
    {
      "timestamp": "2026-07-18T10:13:56.363Z",
      "module": "SYSTEM",
      "action": "DELETE USER",
      "details": "Deleted user U004. Reason: not in use",
      "admin": "ADMIN"
    },
    {
      "timestamp": "2026-07-18T10:14:21.933Z",
      "module": "USER_MGMT",
      "action": "EDIT USER",
      "details": "Updated User U008 (SONY LENIN)",
      "admin": "SYSTEM"
    },
    {
      "timestamp": "2026-07-18T10:14:22.297Z",
      "module": "USER_MGMT",
      "action": "EDIT USER",
      "details": "Updated User U008 (SONY LENIN)",
      "admin": "SYSTEM"
    },
    {
      "timestamp": "2026-07-18T10:14:22.898Z",
      "module": "USER_MGMT",
      "action": "EDIT USER",
      "details": "Updated User U008 (SONY LENIN)",
      "admin": "SYSTEM"
    },
    {
      "timestamp": "2026-07-18T10:14:24.400Z",
      "module": "USER_MGMT",
      "action": "EDIT USER",
      "details": "Updated User U008 (SONY LENIN)",
      "admin": "SYSTEM"
    },
    {
      "timestamp": "2026-07-18T10:14:26.300Z",
      "module": "SYSTEM",
      "action": "RESTRICTION CHANGE",
      "details": "Updated DOWNLOAD_RESTRICTION for U008",
      "admin": "ADMIN"
    },
    {
      "timestamp": "2026-07-18T10:14:26.969Z",
      "module": "USER_MGMT",
      "action": "EDIT USER",
      "details": "Updated User U008 (SONY LENIN)",
      "admin": "SYSTEM"
    },
    {
      "timestamp": "2026-07-18T10:14:27.590Z",
      "module": "SYSTEM",
      "action": "RESTRICTION CHANGE",
      "details": "Updated A for U008",
      "admin": "ADMIN"
    },
    {
      "timestamp": "2026-07-18T10:14:26.946Z",
      "module": "SYSTEM",
      "action": "RESTRICTION CHANGE",
      "details": "Updated A for U008",
      "admin": "ADMIN"
    },
    {
      "timestamp": "2026-07-18T10:14:28.454Z",
      "module": "SYSTEM",
      "action": "RESTRICTION CHANGE",
      "details": "Updated C5 for U008",
      "admin": "ADMIN"
    },
    {
      "timestamp": "2026-07-18T10:14:28.489Z",
      "module": "USER_MGMT",
      "action": "EDIT USER",
      "details": "Updated User U008 (SONY LENIN)",
      "admin": "SYSTEM"
    },
    {
      "timestamp": "2026-07-18T10:14:31.006Z",
      "module": "SYSTEM",
      "action": "RESTRICTION CHANGE",
      "details": "Updated C5 for U008",
      "admin": "ADMIN"
    },
    {
      "timestamp": "2026-07-18T10:14:33.330Z",
      "module": "USER_MGMT",
      "action": "EDIT USER",
      "details": "Updated User U008 (SONY LENIN)",
      "admin": "SYSTEM"
    },
    {
      "timestamp": "2026-07-18T10:14:33.654Z",
      "module": "USER_MGMT",
      "action": "EDIT USER",
      "details": "Updated User U008 (SONY LENIN)",
      "admin": "SYSTEM"
    },
    {
      "timestamp": "2026-07-18T10:14:33.581Z",
      "module": "USER_MGMT",
      "action": "EDIT USER",
      "details": "Updated User U008 (SONY LENIN)",
      "admin": "SYSTEM"
    },
    {
      "timestamp": "2026-07-18T10:14:34.499Z",
      "module": "USER_MGMT",
      "action": "EDIT USER",
      "details": "Updated User U008 (SONY LENIN)",
      "admin": "SYSTEM"
    },
    {
      "timestamp": "2026-07-18T10:14:34.959Z",
      "module": "SYSTEM",
      "action": "RESTRICTION CHANGE",
      "details": "Updated DOWNLOAD_RESTRICTION for U008",
      "admin": "ADMIN"
    },
    {
      "timestamp": "2026-07-18T10:14:36.022Z",
      "module": "USER_MGMT",
      "action": "EDIT USER",
      "details": "Updated User U008 (SONY LENIN)",
      "admin": "SYSTEM"
    },
    {
      "timestamp": "2026-07-18T10:14:37.073Z",
      "module": "USER_MGMT",
      "action": "EDIT USER",
      "details": "Updated User U008 (SONY LENIN)",
      "admin": "SYSTEM"
    },
    {
      "timestamp": "2026-07-18T10:14:37.717Z",
      "module": "USER_MGMT",
      "action": "EDIT USER",
      "details": "Updated User U008 (SONY LENIN)",
      "admin": "SYSTEM"
    },
    {
      "timestamp": "2026-07-18T10:14:37.180Z",
      "module": "SYSTEM",
      "action": "RESTRICTION CHANGE",
      "details": "Updated A4 for U008",
      "admin": "ADMIN"
    },
    {
      "timestamp": "2026-07-18T10:14:37.642Z",
      "module": "SYSTEM",
      "action": "RESTRICTION CHANGE",
      "details": "Updated A3 for U008",
      "admin": "ADMIN"
    },
    {
      "timestamp": "2026-07-18T10:14:38.252Z",
      "module": "USER_MGMT",
      "action": "EDIT USER",
      "details": "Updated User U008 (SONY LENIN)",
      "admin": "SYSTEM"
    },
    {
      "timestamp": "2026-07-18T10:14:37.119Z",
      "module": "USER_MGMT",
      "action": "EDIT USER",
      "details": "Updated User U008 (SONY LENIN)",
      "admin": "SYSTEM"
    },
    {
      "timestamp": "2026-07-18T10:14:38.010Z",
      "module": "SYSTEM",
      "action": "RESTRICTION CHANGE",
      "details": "Updated A6 for U008",
      "admin": "ADMIN"
    },
    {
      "timestamp": "2026-07-18T10:14:39.609Z",
      "module": "SYSTEM",
      "action": "RESTRICTION CHANGE",
      "details": "Updated A2 for U008",
      "admin": "ADMIN"
    },
    {
      "timestamp": "2026-07-18T10:14:41.275Z",
      "module": "SYSTEM",
      "action": "RESTRICTION CHANGE",
      "details": "Updated A4 for U008",
      "admin": "ADMIN"
    },
    {
      "timestamp": "2026-07-18T10:14:42.714Z",
      "module": "SYSTEM",
      "action": "RESTRICTION CHANGE",
      "details": "Updated A2 for U008",
      "admin": "ADMIN"
    },
    {
      "timestamp": "2026-07-18T10:14:42.955Z",
      "module": "SYSTEM",
      "action": "RESTRICTION CHANGE",
      "details": "Updated A7 for U008",
      "admin": "ADMIN"
    },
    {
      "timestamp": "2026-07-18T10:14:43.008Z",
      "module": "SYSTEM",
      "action": "RESTRICTION CHANGE",
      "details": "Updated A3 for U008",
      "admin": "ADMIN"
    },
    {
      "timestamp": "2026-07-18T10:14:43.581Z",
      "module": "SYSTEM",
      "action": "RESTRICTION CHANGE",
      "details": "Updated A5 for U008",
      "admin": "ADMIN"
    },
    {
      "timestamp": "2026-07-18T10:30:33.343Z",
      "module": "USER_MGMT",
      "action": "EDIT USER",
      "details": "Updated User U008 (SONY LENIN)",
      "admin": "SYSTEM"
    },
    {
      "timestamp": "2026-07-18T10:30:36.720Z",
      "module": "SETTINGS",
      "action": "UPDATE_SETTINGS",
      "details": "Updated Settings for U008: Dropdown Update",
      "admin": "SYSTEM"
    },
    {
      "timestamp": "2026-07-18T10:30:38.917Z",
      "module": "SYSTEM",
      "action": "DROPDOWN SETTINGS",
      "details": "Updated settings for U008",
      "admin": "ADMIN"
    },
    {
      "timestamp": "2026-07-18T10:58:22.609Z",
      "module": "USER_MGMT",
      "action": "SAVE_USERS",
      "details": "Saved record to USERS",
      "admin": "SYSTEM"
    },
    {
      "timestamp": "2026-07-18T10:58:31.975Z",
      "module": "SYSTEM",
      "action": "ADD USER",
      "details": "Created user U009 (ARUNDHATHI S NADH)",
      "admin": "ADMIN"
    },
    {
      "timestamp": "2026-07-20T06:47:05.310Z",
      "module": "USER_MGMT",
      "action": "EDIT USER",
      "details": "Updated User U008 (SONY LENIN)",
      "admin": "SYSTEM"
    },
    {
      "timestamp": "2026-07-20T06:47:09.163Z",
      "module": "SETTINGS",
      "action": "UPDATE_SETTINGS",
      "details": "Updated Settings for U008: Dropdown Update",
      "admin": "SYSTEM"
    },
    {
      "timestamp": "2026-07-20T06:47:11.498Z",
      "module": "SYSTEM",
      "action": "DROPDOWN SETTINGS",
      "details": "Updated settings for U008",
      "admin": "ADMIN"
    },
    {
      "timestamp": "2026-07-20T06:48:43.901Z",
      "module": "USER_MGMT",
      "action": "EDIT USER",
      "details": "Updated User U008 (SONY LENIN)",
      "admin": "SYSTEM"
    },
    {
      "timestamp": "2026-07-20T06:48:48.340Z",
      "module": "SETTINGS",
      "action": "UPDATE_SETTINGS",
      "details": "Updated Settings for U008: Dropdown Update",
      "admin": "SYSTEM"
    },
    {
      "timestamp": "2026-07-20T06:48:50.686Z",
      "module": "SYSTEM",
      "action": "DROPDOWN SETTINGS",
      "details": "Updated settings for U008",
      "admin": "ADMIN"
    },
    {
      "timestamp": "2026-07-20T06:51:30.081Z",
      "module": "USER_MGMT",
      "action": "EDIT USER",
      "details": "Updated User U008 (SONY LENIN)",
      "admin": "SYSTEM"
    },
    {
      "timestamp": "2026-07-20T06:51:34.603Z",
      "module": "SETTINGS",
      "action": "UPDATE_SETTINGS",
      "details": "Updated Settings for U008: Dropdown Update",
      "admin": "SYSTEM"
    },
    {
      "timestamp": "2026-07-20T06:51:37.387Z",
      "module": "SYSTEM",
      "action": "DROPDOWN SETTINGS",
      "details": "Updated settings for U008",
      "admin": "ADMIN"
    },
    {
      "timestamp": "2026-07-20T06:53:59.648Z",
      "module": "USER_MGMT",
      "action": "EDIT USER",
      "details": "Updated User U007 (ADITHYA S MENON)",
      "admin": "SYSTEM"
    },
    {
      "timestamp": "2026-07-20T06:54:07.594Z",
      "module": "SYSTEM",
      "action": "EDIT USER",
      "details": "Updated user U007",
      "admin": "ADITHYA S MENON"
    },
    {
      "timestamp": "2026-07-20T06:56:01.121Z",
      "module": "USER_MGMT",
      "action": "EDIT USER",
      "details": "Updated User U007 (ADITHYA S MENON)",
      "admin": "SYSTEM"
    },
    {
      "timestamp": "2026-07-20T06:56:10.429Z",
      "module": "SYSTEM",
      "action": "EDIT USER",
      "details": "Updated user U007",
      "admin": "ADMIN"
    },
    {
      "timestamp": "2026-07-20T06:56:44.104Z",
      "module": "USER_MGMT",
      "action": "EDIT USER",
      "details": "Updated User U007 (ADITHYA S MENON)",
      "admin": "SYSTEM"
    },
    {
      "timestamp": "2026-07-20T06:56:53.547Z",
      "module": "SYSTEM",
      "action": "EDIT USER",
      "details": "Updated user U007",
      "admin": "ADITHYA S MENON"
    },
    {
      "timestamp": "2026-07-20T07:08:25.419Z",
      "module": "SETTINGS",
      "action": "UPDATE_SETTINGS",
      "details": "Updated Settings for U008: Dropdown Update",
      "admin": "SYSTEM"
    },
    {
      "timestamp": "2026-07-20T07:08:27.955Z",
      "module": "SYSTEM",
      "action": "DROPDOWN SETTINGS",
      "details": "Updated settings for U008",
      "admin": "ADITHYA S MENON"
    },
    {
      "timestamp": "2026-07-20T07:49:22.925Z",
      "module": "SETTINGS",
      "action": "UPDATE_SETTINGS",
      "details": "Updated Settings for U008: Dropdown Update",
      "admin": "SYSTEM"
    },
    {
      "timestamp": "2026-07-20T07:49:25.316Z",
      "module": "SYSTEM",
      "action": "DROPDOWN SETTINGS",
      "details": "Updated settings for U008",
      "admin": "ADMIN"
    },
    {
      "timestamp": "2026-07-20T07:50:06.201Z",
      "module": "USER_MGMT",
      "action": "EDIT USER",
      "details": "Updated User U008 (SONY LENIN)",
      "admin": "SYSTEM"
    },
    {
      "timestamp": "2026-07-20T07:50:07.233Z",
      "module": "USER_MGMT",
      "action": "EDIT USER",
      "details": "Updated User U008 (SONY LENIN)",
      "admin": "SYSTEM"
    },
    {
      "timestamp": "2026-07-20T07:50:10.701Z",
      "module": "SYSTEM",
      "action": "RESTRICTION CHANGE",
      "details": "Updated B for U008",
      "admin": "ADITHYA S MENON"
    },
    {
      "timestamp": "2026-07-20T07:50:12.528Z",
      "module": "SYSTEM",
      "action": "RESTRICTION CHANGE",
      "details": "Updated B1 for U008",
      "admin": "ADITHYA S MENON"
    },
    {
      "timestamp": "2026-07-20T07:50:53.794Z",
      "module": "USER_MGMT",
      "action": "EDIT USER",
      "details": "Updated User U008 (SONY LENIN)",
      "admin": "SYSTEM"
    },
    {
      "timestamp": "2026-07-20T07:50:59.597Z",
      "module": "SYSTEM",
      "action": "RESTRICTION CHANGE",
      "details": "Updated B1 for U008",
      "admin": "ADMIN"
    },
    {
      "timestamp": "2026-07-20T09:51:53.495Z",
      "module": "SETTINGS",
      "action": "UPDATE_SETTINGS",
      "details": "Updated Settings for U008: Dropdown Update",
      "admin": "SYSTEM"
    },
    {
      "timestamp": "2026-07-20T09:51:55.793Z",
      "module": "SYSTEM",
      "action": "DROPDOWN SETTINGS",
      "details": "Updated settings for U008",
      "admin": "ADITHYA S MENON"
    },
    {
      "timestamp": "2026-07-20T11:15:36.240Z",
      "module": "SETTINGS",
      "action": "UPDATE_SETTINGS",
      "details": "Updated Settings for U008: Dropdown Update",
      "admin": "SYSTEM"
    },
    {
      "timestamp": "2026-07-20T11:15:39.205Z",
      "module": "SYSTEM",
      "action": "DROPDOWN SETTINGS",
      "details": "Updated settings for U008",
      "admin": "ADMIN"
    },
    {
      "timestamp": "2026-07-21T05:38:23.288Z",
      "module": "USER_MGMT",
      "action": "SAVE_USERS",
      "details": "Saved record to USERS",
      "admin": "SYSTEM"
    },
    {
      "timestamp": "2026-07-21T05:38:39.557Z",
      "module": "SYSTEM",
      "action": "ADD USER",
      "details": "Created user U010 (SARI SATHYAN)",
      "admin": "ADITHYA S MENON"
    },
    {
      "timestamp": "2026-07-21T05:39:50.054Z",
      "module": "USER_MGMT",
      "action": "EDIT USER",
      "details": "Updated User U010 (SARI SATHYAN)",
      "admin": "SYSTEM"
    },
    {
      "timestamp": "2026-07-21T05:39:55.552Z",
      "module": "USER_MGMT",
      "action": "EDIT USER",
      "details": "Updated User U010 (SARI SATHYAN)",
      "admin": "SYSTEM"
    },
    {
      "timestamp": "2026-07-21T05:39:56.958Z",
      "module": "USER_MGMT",
      "action": "EDIT USER",
      "details": "Updated User U010 (SARI SATHYAN)",
      "admin": "SYSTEM"
    },
    {
      "timestamp": "2026-07-21T05:39:56.479Z",
      "module": "SYSTEM",
      "action": "RESTRICTION CHANGE",
      "details": "Updated DOWNLOAD_RESTRICTION for U010",
      "admin": "ADITHYA S MENON"
    },
    {
      "timestamp": "2026-07-21T05:39:59.013Z",
      "module": "USER_MGMT",
      "action": "EDIT USER",
      "details": "Updated User U010 (SARI SATHYAN)",
      "admin": "SYSTEM"
    },
    {
      "timestamp": "2026-07-21T05:40:00.494Z",
      "module": "USER_MGMT",
      "action": "EDIT USER",
      "details": "Updated User U010 (SARI SATHYAN)",
      "admin": "SYSTEM"
    },
    {
      "timestamp": "2026-07-21T05:40:01.768Z",
      "module": "USER_MGMT",
      "action": "EDIT USER",
      "details": "Updated User U010 (SARI SATHYAN)",
      "admin": "SYSTEM"
    },
    {
      "timestamp": "2026-07-21T05:40:02.208Z",
      "module": "SYSTEM",
      "action": "RESTRICTION CHANGE",
      "details": "Updated DOWNLOAD_RESTRICTION for U010",
      "admin": "ADITHYA S MENON"
    },
    {
      "timestamp": "2026-07-21T05:40:04.681Z",
      "module": "SYSTEM",
      "action": "RESTRICTION CHANGE",
      "details": "Updated C2 for U010",
      "admin": "ADITHYA S MENON"
    },
    {
      "timestamp": "2026-07-21T05:40:04.827Z",
      "module": "USER_MGMT",
      "action": "EDIT USER",
      "details": "Updated User U010 (SARI SATHYAN)",
      "admin": "SYSTEM"
    },
    {
      "timestamp": "2026-07-21T05:40:05.584Z",
      "module": "USER_MGMT",
      "action": "EDIT USER",
      "details": "Updated User U010 (SARI SATHYAN)",
      "admin": "SYSTEM"
    },
    {
      "timestamp": "2026-07-21T05:40:04.889Z",
      "module": "USER_MGMT",
      "action": "EDIT USER",
      "details": "Updated User U010 (SARI SATHYAN)",
      "admin": "SYSTEM"
    },
    {
      "timestamp": "2026-07-21T05:40:06.246Z",
      "module": "SYSTEM",
      "action": "RESTRICTION CHANGE",
      "details": "Updated C5 for U010",
      "admin": "ADITHYA S MENON"
    },
    {
      "timestamp": "2026-07-21T05:40:06.419Z",
      "module": "SYSTEM",
      "action": "RESTRICTION CHANGE",
      "details": "Updated C1 for U010",
      "admin": "ADITHYA S MENON"
    },
    {
      "timestamp": "2026-07-21T05:40:09.183Z",
      "module": "USER_MGMT",
      "action": "EDIT USER",
      "details": "Updated User U010 (SARI SATHYAN)",
      "admin": "SYSTEM"
    },
    {
      "timestamp": "2026-07-21T05:40:10.446Z",
      "module": "USER_MGMT",
      "action": "EDIT USER",
      "details": "Updated User U010 (SARI SATHYAN)",
      "admin": "SYSTEM"
    },
    {
      "timestamp": "2026-07-21T05:40:11.461Z",
      "module": "SYSTEM",
      "action": "RESTRICTION CHANGE",
      "details": "Updated C3 for U010",
      "admin": "ADITHYA S MENON"
    },
    {
      "timestamp": "2026-07-21T05:40:11.652Z",
      "module": "SYSTEM",
      "action": "RESTRICTION CHANGE",
      "details": "Updated C7 for U010",
      "admin": "ADITHYA S MENON"
    },
    {
      "timestamp": "2026-07-21T05:40:12.084Z",
      "module": "USER_MGMT",
      "action": "EDIT USER",
      "details": "Updated User U010 (SARI SATHYAN)",
      "admin": "SYSTEM"
    },
    {
      "timestamp": "2026-07-21T05:40:13.172Z",
      "module": "SYSTEM",
      "action": "RESTRICTION CHANGE",
      "details": "Updated C4 for U010",
      "admin": "ADITHYA S MENON"
    },
    {
      "timestamp": "2026-07-21T05:40:13.352Z",
      "module": "USER_MGMT",
      "action": "EDIT USER",
      "details": "Updated User U010 (SARI SATHYAN)",
      "admin": "SYSTEM"
    },
    {
      "timestamp": "2026-07-21T05:40:13.946Z",
      "module": "SYSTEM",
      "action": "RESTRICTION CHANGE",
      "details": "Updated C6 for U010",
      "admin": "ADITHYA S MENON"
    },
    {
      "timestamp": "2026-07-21T05:40:14.203Z",
      "module": "SYSTEM",
      "action": "RESTRICTION CHANGE",
      "details": "Updated C5 for U010",
      "admin": "ADITHYA S MENON"
    },
    {
      "timestamp": "2026-07-21T05:40:14.795Z",
      "module": "USER_MGMT",
      "action": "EDIT USER",
      "details": "Updated User U010 (SARI SATHYAN)",
      "admin": "SYSTEM"
    },
    {
      "timestamp": "2026-07-21T05:40:16.776Z",
      "module": "SYSTEM",
      "action": "RESTRICTION CHANGE",
      "details": "Updated C4 for U010",
      "admin": "ADITHYA S MENON"
    },
    {
      "timestamp": "2026-07-21T05:40:17.969Z",
      "module": "SYSTEM",
      "action": "RESTRICTION CHANGE",
      "details": "Updated C1 for U010",
      "admin": "ADITHYA S MENON"
    },
    {
      "timestamp": "2026-07-21T05:40:18.902Z",
      "module": "SYSTEM",
      "action": "RESTRICTION CHANGE",
      "details": "Updated C2 for U010",
      "admin": "ADITHYA S MENON"
    },
    {
      "timestamp": "2026-07-21T05:40:20.283Z",
      "module": "USER_MGMT",
      "action": "EDIT USER",
      "details": "Updated User U010 (SARI SATHYAN)",
      "admin": "SYSTEM"
    },
    {
      "timestamp": "2026-07-21T05:40:22.107Z",
      "module": "USER_MGMT",
      "action": "EDIT USER",
      "details": "Updated User U010 (SARI SATHYAN)",
      "admin": "SYSTEM"
    },
    {
      "timestamp": "2026-07-21T05:40:23.005Z",
      "module": "USER_MGMT",
      "action": "EDIT USER",
      "details": "Updated User U010 (SARI SATHYAN)",
      "admin": "SYSTEM"
    },
    {
      "timestamp": "2026-07-21T05:40:24.005Z",
      "module": "SYSTEM",
      "action": "RESTRICTION CHANGE",
      "details": "Updated C6 for U010",
      "admin": "ADITHYA S MENON"
    },
    {
      "timestamp": "2026-07-21T05:40:26.666Z",
      "module": "SYSTEM",
      "action": "RESTRICTION CHANGE",
      "details": "Updated C5 for U010",
      "admin": "ADITHYA S MENON"
    },
    {
      "timestamp": "2026-07-21T05:40:26.878Z",
      "module": "SYSTEM",
      "action": "RESTRICTION CHANGE",
      "details": "Updated C6 for U010",
      "admin": "ADITHYA S MENON"
    },
    {
      "timestamp": "2026-07-21T05:40:29.141Z",
      "module": "USER_MGMT",
      "action": "EDIT USER",
      "details": "Updated User U010 (SARI SATHYAN)",
      "admin": "SYSTEM"
    },
    {
      "timestamp": "2026-07-21T05:40:29.530Z",
      "module": "SYSTEM",
      "action": "RESTRICTION CHANGE",
      "details": "Updated C5 for U010",
      "admin": "ADITHYA S MENON"
    },
    {
      "timestamp": "2026-07-21T05:40:31.003Z",
      "module": "USER_MGMT",
      "action": "EDIT USER",
      "details": "Updated User U010 (SARI SATHYAN)",
      "admin": "SYSTEM"
    },
    {
      "timestamp": "2026-07-21T05:40:32.186Z",
      "module": "USER_MGMT",
      "action": "EDIT USER",
      "details": "Updated User U010 (SARI SATHYAN)",
      "admin": "SYSTEM"
    },
    {
      "timestamp": "2026-07-21T05:40:35.029Z",
      "module": "USER_MGMT",
      "action": "EDIT USER",
      "details": "Updated User U010 (SARI SATHYAN)",
      "admin": "SYSTEM"
    },
    {
      "timestamp": "2026-07-21T05:40:35.569Z",
      "module": "SYSTEM",
      "action": "RESTRICTION CHANGE",
      "details": "Updated A3 for U010",
      "admin": "ADITHYA S MENON"
    },
    {
      "timestamp": "2026-07-21T05:40:35.761Z",
      "module": "SYSTEM",
      "action": "RESTRICTION CHANGE",
      "details": "Updated A1 for U010",
      "admin": "ADITHYA S MENON"
    },
    {
      "timestamp": "2026-07-21T05:40:38.103Z",
      "module": "USER_MGMT",
      "action": "EDIT USER",
      "details": "Updated User U010 (SARI SATHYAN)",
      "admin": "SYSTEM"
    },
    {
      "timestamp": "2026-07-21T05:40:39.024Z",
      "module": "USER_MGMT",
      "action": "EDIT USER",
      "details": "Updated User U010 (SARI SATHYAN)",
      "admin": "SYSTEM"
    },
    {
      "timestamp": "2026-07-21T05:40:39.798Z",
      "module": "SYSTEM",
      "action": "RESTRICTION CHANGE",
      "details": "Updated A4 for U010",
      "admin": "ADITHYA S MENON"
    },
    {
      "timestamp": "2026-07-21T05:40:40.699Z",
      "module": "SYSTEM",
      "action": "RESTRICTION CHANGE",
      "details": "Updated A1 for U010",
      "admin": "ADITHYA S MENON"
    },
    {
      "timestamp": "2026-07-21T05:40:41.306Z",
      "module": "USER_MGMT",
      "action": "EDIT USER",
      "details": "Updated User U010 (SARI SATHYAN)",
      "admin": "SYSTEM"
    },
    {
      "timestamp": "2026-07-21T05:40:42.553Z",
      "module": "USER_MGMT",
      "action": "EDIT USER",
      "details": "Updated User U010 (SARI SATHYAN)",
      "admin": "SYSTEM"
    },
    {
      "timestamp": "2026-07-21T05:40:43.967Z",
      "module": "SYSTEM",
      "action": "RESTRICTION CHANGE",
      "details": "Updated A6 for U010",
      "admin": "ADITHYA S MENON"
    },
    {
      "timestamp": "2026-07-21T05:40:43.773Z",
      "module": "USER_MGMT",
      "action": "EDIT USER",
      "details": "Updated User U010 (SARI SATHYAN)",
      "admin": "SYSTEM"
    },
    {
      "timestamp": "2026-07-21T05:40:46.046Z",
      "module": "SYSTEM",
      "action": "RESTRICTION CHANGE",
      "details": "Updated A5 for U010",
      "admin": "ADITHYA S MENON"
    },
    {
      "timestamp": "2026-07-21T05:40:46.707Z",
      "module": "SYSTEM",
      "action": "RESTRICTION CHANGE",
      "details": "Updated A7 for U010",
      "admin": "ADITHYA S MENON"
    },
    {
      "timestamp": "2026-07-21T05:40:47.750Z",
      "module": "USER_MGMT",
      "action": "EDIT USER",
      "details": "Updated User U010 (SARI SATHYAN)",
      "admin": "SYSTEM"
    },
    {
      "timestamp": "2026-07-21T05:40:49.614Z",
      "module": "USER_MGMT",
      "action": "EDIT USER",
      "details": "Updated User U010 (SARI SATHYAN)",
      "admin": "SYSTEM"
    },
    {
      "timestamp": "2026-07-21T05:40:49.695Z",
      "module": "SYSTEM",
      "action": "RESTRICTION CHANGE",
      "details": "Updated A5 for U010",
      "admin": "ADITHYA S MENON"
    },
    {
      "timestamp": "2026-07-21T05:40:50.238Z",
      "module": "SYSTEM",
      "action": "RESTRICTION CHANGE",
      "details": "Updated A6 for U010",
      "admin": "ADITHYA S MENON"
    },
    {
      "timestamp": "2026-07-21T05:40:51.114Z",
      "module": "USER_MGMT",
      "action": "EDIT USER",
      "details": "Updated User U010 (SARI SATHYAN)",
      "admin": "SYSTEM"
    },
    {
      "timestamp": "2026-07-21T05:40:52.092Z",
      "module": "SYSTEM",
      "action": "RESTRICTION CHANGE",
      "details": "Updated B for U010",
      "admin": "ADITHYA S MENON"
    },
    {
      "timestamp": "2026-07-21T05:40:52.175Z",
      "module": "USER_MGMT",
      "action": "EDIT USER",
      "details": "Updated User U010 (SARI SATHYAN)",
      "admin": "SYSTEM"
    },
    {
      "timestamp": "2026-07-21T05:40:54.414Z",
      "module": "SYSTEM",
      "action": "RESTRICTION CHANGE",
      "details": "Updated B1 for U010",
      "admin": "ADITHYA S MENON"
    },
    {
      "timestamp": "2026-07-21T05:40:54.860Z",
      "module": "USER_MGMT",
      "action": "EDIT USER",
      "details": "Updated User U010 (SARI SATHYAN)",
      "admin": "SYSTEM"
    },
    {
      "timestamp": "2026-07-21T05:40:56.696Z",
      "module": "USER_MGMT",
      "action": "EDIT USER",
      "details": "Updated User U010 (SARI SATHYAN)",
      "admin": "SYSTEM"
    },
    {
      "timestamp": "2026-07-21T05:40:56.674Z",
      "module": "SYSTEM",
      "action": "RESTRICTION CHANGE",
      "details": "Updated B3 for U010",
      "admin": "ADITHYA S MENON"
    },
    {
      "timestamp": "2026-07-21T05:40:57.765Z",
      "module": "SYSTEM",
      "action": "RESTRICTION CHANGE",
      "details": "Updated B2 for U010",
      "admin": "ADITHYA S MENON"
    },
    {
      "timestamp": "2026-07-21T05:40:58.227Z",
      "module": "USER_MGMT",
      "action": "EDIT USER",
      "details": "Updated User U010 (SARI SATHYAN)",
      "admin": "SYSTEM"
    },
    {
      "timestamp": "2026-07-21T05:40:59.224Z",
      "module": "USER_MGMT",
      "action": "EDIT USER",
      "details": "Updated User U010 (SARI SATHYAN)",
      "admin": "SYSTEM"
    },
    {
      "timestamp": "2026-07-21T05:41:00.328Z",
      "module": "USER_MGMT",
      "action": "EDIT USER",
      "details": "Updated User U010 (SARI SATHYAN)",
      "admin": "SYSTEM"
    },
    {
      "timestamp": "2026-07-21T05:41:00.756Z",
      "module": "SYSTEM",
      "action": "RESTRICTION CHANGE",
      "details": "Updated B4 for U010",
      "admin": "ADITHYA S MENON"
    },
    {
      "timestamp": "2026-07-21T05:41:01.970Z",
      "module": "USER_MGMT",
      "action": "EDIT USER",
      "details": "Updated User U010 (SARI SATHYAN)",
      "admin": "SYSTEM"
    },
    {
      "timestamp": "2026-07-21T05:41:02.040Z",
      "module": "SYSTEM",
      "action": "RESTRICTION CHANGE",
      "details": "Updated B5 for U010",
      "admin": "ADITHYA S MENON"
    },
    {
      "timestamp": "2026-07-21T05:41:02.924Z",
      "module": "SYSTEM",
      "action": "RESTRICTION CHANGE",
      "details": "Updated B6 for U010",
      "admin": "ADITHYA S MENON"
    },
    {
      "timestamp": "2026-07-21T05:41:02.854Z",
      "module": "USER_MGMT",
      "action": "EDIT USER",
      "details": "Updated User U010 (SARI SATHYAN)",
      "admin": "SYSTEM"
    },
    {
      "timestamp": "2026-07-21T05:41:03.930Z",
      "module": "USER_MGMT",
      "action": "EDIT USER",
      "details": "Updated User U010 (SARI SATHYAN)",
      "admin": "SYSTEM"
    },
    {
      "timestamp": "2026-07-21T05:41:03.857Z",
      "module": "SYSTEM",
      "action": "RESTRICTION CHANGE",
      "details": "Updated B7 for U010",
      "admin": "ADITHYA S MENON"
    },
    {
      "timestamp": "2026-07-21T05:41:04.869Z",
      "module": "SYSTEM",
      "action": "RESTRICTION CHANGE",
      "details": "Updated B8 for U010",
      "admin": "ADITHYA S MENON"
    },
    {
      "timestamp": "2026-07-21T05:41:05.880Z",
      "module": "USER_MGMT",
      "action": "EDIT USER",
      "details": "Updated User U010 (SARI SATHYAN)",
      "admin": "SYSTEM"
    },
    {
      "timestamp": "2026-07-21T05:41:06.576Z",
      "module": "SYSTEM",
      "action": "RESTRICTION CHANGE",
      "details": "Updated B9 for U010",
      "admin": "ADITHYA S MENON"
    },
    {
      "timestamp": "2026-07-21T05:41:07.660Z",
      "module": "USER_MGMT",
      "action": "EDIT USER",
      "details": "Updated User U010 (SARI SATHYAN)",
      "admin": "SYSTEM"
    },
    {
      "timestamp": "2026-07-21T05:41:07.737Z",
      "module": "SYSTEM",
      "action": "RESTRICTION CHANGE",
      "details": "Updated B8 for U010",
      "admin": "ADITHYA S MENON"
    },
    {
      "timestamp": "2026-07-21T05:41:09.237Z",
      "module": "SYSTEM",
      "action": "RESTRICTION CHANGE",
      "details": "Updated B7 for U010",
      "admin": "ADITHYA S MENON"
    },
    {
      "timestamp": "2026-07-21T05:41:09.587Z",
      "module": "USER_MGMT",
      "action": "EDIT USER",
      "details": "Updated User U010 (SARI SATHYAN)",
      "admin": "SYSTEM"
    },
    {
      "timestamp": "2026-07-21T05:41:09.939Z",
      "module": "SYSTEM",
      "action": "RESTRICTION CHANGE",
      "details": "Updated B6 for U010",
      "admin": "ADITHYA S MENON"
    },
    {
      "timestamp": "2026-07-21T05:41:10.794Z",
      "module": "USER_MGMT",
      "action": "EDIT USER",
      "details": "Updated User U010 (SARI SATHYAN)",
      "admin": "SYSTEM"
    },
    {
      "timestamp": "2026-07-21T05:41:11.971Z",
      "module": "USER_MGMT",
      "action": "EDIT USER",
      "details": "Updated User U010 (SARI SATHYAN)",
      "admin": "SYSTEM"
    },
    {
      "timestamp": "2026-07-21T05:41:11.397Z",
      "module": "SYSTEM",
      "action": "RESTRICTION CHANGE",
      "details": "Updated B for U010",
      "admin": "ADITHYA S MENON"
    },
    {
      "timestamp": "2026-07-21T05:41:13.535Z",
      "module": "USER_MGMT",
      "action": "EDIT USER",
      "details": "Updated User U010 (SARI SATHYAN)",
      "admin": "SYSTEM"
    },
    {
      "timestamp": "2026-07-21T05:41:14.040Z",
      "module": "SYSTEM",
      "action": "RESTRICTION CHANGE",
      "details": "Updated B2 for U010",
      "admin": "ADITHYA S MENON"
    },
    {
      "timestamp": "2026-07-21T05:41:16.314Z",
      "module": "SYSTEM",
      "action": "RESTRICTION CHANGE",
      "details": "Updated B1 for U010",
      "admin": "ADITHYA S MENON"
    },
    {
      "timestamp": "2026-07-21T05:41:16.681Z",
      "module": "SYSTEM",
      "action": "RESTRICTION CHANGE",
      "details": "Updated B1 for U010",
      "admin": "ADITHYA S MENON"
    },
    {
      "timestamp": "2026-07-21T05:41:18.965Z",
      "module": "SYSTEM",
      "action": "RESTRICTION CHANGE",
      "details": "Updated B for U010",
      "admin": "ADITHYA S MENON"
    },
    {
      "timestamp": "2026-07-21T06:01:48.140Z",
      "module": "USER_MGMT",
      "action": "EDIT USER",
      "details": "Updated User U010 (SARI SATHYAN)",
      "admin": "SYSTEM"
    },
    {
      "timestamp": "2026-07-21T06:01:52.250Z",
      "module": "SYSTEM",
      "action": "RESTRICTION CHANGE",
      "details": "Updated B1 for U010",
      "admin": "ADMIN"
    },
    {
      "timestamp": "2026-07-21T06:20:23.518Z",
      "module": "USER_MGMT",
      "action": "EDIT USER",
      "details": "Updated User U002 (NIMMY)",
      "admin": "SYSTEM"
    },
    {
      "timestamp": "2026-07-21T06:20:27.633Z",
      "module": "SETTINGS",
      "action": "UPDATE_SETTINGS",
      "details": "Updated Settings for U002: Dropdown Update",
      "admin": "SYSTEM"
    },
    {
      "timestamp": "2026-07-21T06:20:30.406Z",
      "module": "SYSTEM",
      "action": "DROPDOWN SETTINGS",
      "details": "Updated settings for U002",
      "admin": "ADMIN"
    },
    {
      "timestamp": "2026-07-21T11:46:09.973Z",
      "module": "USER_MGMT",
      "action": "SAVE_USERS",
      "details": "Saved record to USERS",
      "admin": "SYSTEM"
    },
    {
      "timestamp": "2026-07-21T11:46:20.009Z",
      "module": "SYSTEM",
      "action": "ADD USER",
      "details": "Created user U011 (ADITHYA)",
      "admin": "ADMIN"
    },
    {
      "timestamp": "2026-07-23T08:12:02.703Z",
      "module": "USER_MGMT",
      "action": "EDIT USER",
      "details": "Updated User U002 (NIMMY)",
      "admin": "SYSTEM"
    },
    {
      "timestamp": "2026-07-23T08:12:08.564Z",
      "module": "SETTINGS",
      "action": "UPDATE_SETTINGS",
      "details": "Updated Settings for U002: Dropdown Update",
      "admin": "SYSTEM"
    },
    {
      "timestamp": "2026-07-23T08:12:10.657Z",
      "module": "SYSTEM",
      "action": "DROPDOWN SETTINGS",
      "details": "Updated settings for U002",
      "admin": "ADMIN"
    },
    {
      "timestamp": "2026-07-24T11:21:03.484Z",
      "module": "SETTINGS",
      "action": "UPDATE_SETTINGS",
      "details": "Updated Settings for U008: Dropdown Update",
      "admin": "SYSTEM"
    },
    {
      "timestamp": "2026-07-24T11:21:06.355Z",
      "module": "SYSTEM",
      "action": "DROPDOWN SETTINGS",
      "details": "Updated settings for U008",
      "admin": "ADMIN"
    },
    {
      "timestamp": "2026-07-27T05:13:40.707Z",
      "module": "SETTINGS",
      "action": "UPDATE_SETTINGS",
      "details": "Updated Settings for U008: Dropdown Update",
      "admin": "SYSTEM"
    },
    {
      "timestamp": "2026-07-27T05:13:43.351Z",
      "module": "SYSTEM",
      "action": "DROPDOWN SETTINGS",
      "details": "Updated settings for U008",
      "admin": "ADMIN"
    },
    {
      "timestamp": "2026-07-30T06:26:46.142Z",
      "module": "USER_MGMT",
      "action": "SAVE_USERS",
      "details": "Saved record to USERS",
      "admin": "SYSTEM"
    },
    {
      "timestamp": "2026-07-30T06:26:58.090Z",
      "module": "SYSTEM",
      "action": "ADD USER",
      "details": "Created user U012 (PRATHEEKSHA)",
      "admin": "ADMIN"
    },
    {
      "timestamp": "2026-07-30T06:27:50.017Z",
      "module": "SETTINGS",
      "action": "UPDATE_SETTINGS",
      "details": "Updated Settings for U012: Dropdown Update",
      "admin": "SYSTEM"
    },
    {
      "timestamp": "2026-07-30T06:27:53.700Z",
      "module": "SYSTEM",
      "action": "DROPDOWN SETTINGS",
      "details": "Updated settings for U012",
      "admin": "ADMIN"
    },
    {
      "timestamp": "2026-07-30T06:28:32.373Z",
      "module": "SETTINGS",
      "action": "UPDATE_SETTINGS",
      "details": "Updated Settings for U012: Dropdown Update",
      "admin": "SYSTEM"
    },
    {
      "timestamp": "2026-07-30T06:28:34.578Z",
      "module": "SYSTEM",
      "action": "DROPDOWN SETTINGS",
      "details": "Updated settings for U012",
      "admin": "ADMIN"
    },
    {
      "timestamp": "2026-07-30T06:29:09.617Z",
      "module": "USER_MGMT",
      "action": "EDIT USER",
      "details": "Updated User U012 (PRATHEEKSHA)",
      "admin": "SYSTEM"
    },
    {
      "timestamp": "2026-07-30T06:29:10.565Z",
      "module": "USER_MGMT",
      "action": "EDIT USER",
      "details": "Updated User U012 (PRATHEEKSHA)",
      "admin": "SYSTEM"
    },
    {
      "timestamp": "2026-07-30T06:29:10.030Z",
      "module": "USER_MGMT",
      "action": "EDIT USER",
      "details": "Updated User U012 (PRATHEEKSHA)",
      "admin": "SYSTEM"
    },
    {
      "timestamp": "2026-07-30T06:29:12.531Z",
      "module": "USER_MGMT",
      "action": "EDIT USER",
      "details": "Updated User U012 (PRATHEEKSHA)",
      "admin": "SYSTEM"
    },
    {
      "timestamp": "2026-07-30T06:29:12.650Z",
      "module": "USER_MGMT",
      "action": "EDIT USER",
      "details": "Updated User U012 (PRATHEEKSHA)",
      "admin": "SYSTEM"
    },
    {
      "timestamp": "2026-07-30T06:29:12.866Z",
      "module": "USER_MGMT",
      "action": "EDIT USER",
      "details": "Updated User U012 (PRATHEEKSHA)",
      "admin": "SYSTEM"
    },
    {
      "timestamp": "2026-07-30T06:29:13.431Z",
      "module": "USER_MGMT",
      "action": "EDIT USER",
      "details": "Updated User U012 (PRATHEEKSHA)",
      "admin": "SYSTEM"
    },
    {
      "timestamp": "2026-07-30T06:29:14.960Z",
      "module": "USER_MGMT",
      "action": "EDIT USER",
      "details": "Updated User U012 (PRATHEEKSHA)",
      "admin": "SYSTEM"
    },
    {
      "timestamp": "2026-07-30T06:29:18.125Z",
      "module": "SYSTEM",
      "action": "RESTRICTION CHANGE",
      "details": "Updated A1 for U012",
      "admin": "ADMIN"
    },
    {
      "timestamp": "2026-07-30T06:29:18.786Z",
      "module": "SYSTEM",
      "action": "RESTRICTION CHANGE",
      "details": "Updated A4 for U012",
      "admin": "ADMIN"
    },
    {
      "timestamp": "2026-07-30T06:29:19.041Z",
      "module": "SYSTEM",
      "action": "RESTRICTION CHANGE",
      "details": "Updated A1 for U012",
      "admin": "ADMIN"
    },
    {
      "timestamp": "2026-07-30T06:29:18.933Z",
      "module": "USER_MGMT",
      "action": "EDIT USER",
      "details": "Updated User U012 (PRATHEEKSHA)",
      "admin": "SYSTEM"
    },
    {
      "timestamp": "2026-07-30T06:29:19.570Z",
      "module": "SYSTEM",
      "action": "RESTRICTION CHANGE",
      "details": "Updated A5 for U012",
      "admin": "ADMIN"
    },
    {
      "timestamp": "2026-07-30T06:29:20.086Z",
      "module": "SYSTEM",
      "action": "RESTRICTION CHANGE",
      "details": "Updated A2 for U012",
      "admin": "ADMIN"
    },
    {
      "timestamp": "2026-07-30T06:29:19.043Z",
      "module": "USER_MGMT",
      "action": "EDIT USER",
      "details": "Updated User U012 (PRATHEEKSHA)",
      "admin": "SYSTEM"
    },
    {
      "timestamp": "2026-07-30T06:29:19.975Z",
      "module": "SYSTEM",
      "action": "RESTRICTION CHANGE",
      "details": "Updated A6 for U012",
      "admin": "ADMIN"
    },
    {
      "timestamp": "2026-07-30T06:29:20.582Z",
      "module": "USER_MGMT",
      "action": "EDIT USER",
      "details": "Updated User U012 (PRATHEEKSHA)",
      "admin": "SYSTEM"
    },
    {
      "timestamp": "2026-07-30T06:29:20.515Z",
      "module": "USER_MGMT",
      "action": "EDIT USER",
      "details": "Updated User U012 (PRATHEEKSHA)",
      "admin": "SYSTEM"
    },
    {
      "timestamp": "2026-07-30T06:29:20.667Z",
      "module": "USER_MGMT",
      "action": "EDIT USER",
      "details": "Updated User U012 (PRATHEEKSHA)",
      "admin": "SYSTEM"
    },
    {
      "timestamp": "2026-07-30T06:29:21.878Z",
      "module": "SYSTEM",
      "action": "RESTRICTION CHANGE",
      "details": "Updated A7 for U012",
      "admin": "ADMIN"
    },
    {
      "timestamp": "2026-07-30T06:29:22.989Z",
      "module": "USER_MGMT",
      "action": "EDIT USER",
      "details": "Updated User U012 (PRATHEEKSHA)",
      "admin": "SYSTEM"
    },
    {
      "timestamp": "2026-07-30T06:29:21.960Z",
      "module": "SYSTEM",
      "action": "RESTRICTION CHANGE",
      "details": "Updated A3 for U012",
      "admin": "ADMIN"
    },
    {
      "timestamp": "2026-07-30T06:29:22.899Z",
      "module": "USER_MGMT",
      "action": "EDIT USER",
      "details": "Updated User U012 (PRATHEEKSHA)",
      "admin": "SYSTEM"
    },
    {
      "timestamp": "2026-07-30T06:29:25.444Z",
      "module": "SYSTEM",
      "action": "RESTRICTION CHANGE",
      "details": "Updated B6 for U012",
      "admin": "ADMIN"
    },
    {
      "timestamp": "2026-07-30T06:29:25.325Z",
      "module": "USER_MGMT",
      "action": "EDIT USER",
      "details": "Updated User U012 (PRATHEEKSHA)",
      "admin": "SYSTEM"
    },
    {
      "timestamp": "2026-07-30T06:29:25.609Z",
      "module": "USER_MGMT",
      "action": "EDIT USER",
      "details": "Updated User U012 (PRATHEEKSHA)",
      "admin": "SYSTEM"
    },
    {
      "timestamp": "2026-07-30T06:29:24.904Z",
      "module": "USER_MGMT",
      "action": "EDIT USER",
      "details": "Updated User U012 (PRATHEEKSHA)",
      "admin": "SYSTEM"
    },
    {
      "timestamp": "2026-07-30T06:29:26.996Z",
      "module": "USER_MGMT",
      "action": "EDIT USER",
      "details": "Updated User U012 (PRATHEEKSHA)",
      "admin": "SYSTEM"
    },
    {
      "timestamp": "2026-07-30T06:29:26.530Z",
      "module": "SYSTEM",
      "action": "RESTRICTION CHANGE",
      "details": "Updated B3 for U012",
      "admin": "ADMIN"
    },
    {
      "timestamp": "2026-07-30T06:29:27.348Z",
      "module": "USER_MGMT",
      "action": "EDIT USER",
      "details": "Updated User U012 (PRATHEEKSHA)",
      "admin": "SYSTEM"
    },
    {
      "timestamp": "2026-07-30T06:29:27.175Z",
      "module": "USER_MGMT",
      "action": "EDIT USER",
      "details": "Updated User U012 (PRATHEEKSHA)",
      "admin": "SYSTEM"
    },
    {
      "timestamp": "2026-07-30T06:29:27.163Z",
      "module": "SYSTEM",
      "action": "RESTRICTION CHANGE",
      "details": "Updated B5 for U012",
      "admin": "ADMIN"
    },
    {
      "timestamp": "2026-07-30T06:29:27.409Z",
      "module": "SYSTEM",
      "action": "RESTRICTION CHANGE",
      "details": "Updated B4 for U012",
      "admin": "ADMIN"
    },
    {
      "timestamp": "2026-07-30T06:29:29.229Z",
      "module": "SYSTEM",
      "action": "RESTRICTION CHANGE",
      "details": "Updated B2 for U012",
      "admin": "ADMIN"
    },
    {
      "timestamp": "2026-07-30T06:29:28.593Z",
      "module": "USER_MGMT",
      "action": "EDIT USER",
      "details": "Updated User U012 (PRATHEEKSHA)",
      "admin": "SYSTEM"
    },
    {
      "timestamp": "2026-07-30T06:29:31.833Z",
      "module": "SYSTEM",
      "action": "RESTRICTION CHANGE",
      "details": "Updated B8 for U012",
      "admin": "ADMIN"
    },
    {
      "timestamp": "2026-07-30T06:29:31.568Z",
      "module": "SYSTEM",
      "action": "RESTRICTION CHANGE",
      "details": "Updated B9 for U012",
      "admin": "ADMIN"
    },
    {
      "timestamp": "2026-07-30T06:29:32.550Z",
      "module": "SYSTEM",
      "action": "RESTRICTION CHANGE",
      "details": "Updated C1 for U012",
      "admin": "ADMIN"
    },
    {
      "timestamp": "2026-07-30T06:29:32.933Z",
      "module": "SYSTEM",
      "action": "RESTRICTION CHANGE",
      "details": "Updated C for U012",
      "admin": "ADMIN"
    },
    {
      "timestamp": "2026-07-30T06:29:33.213Z",
      "module": "SYSTEM",
      "action": "RESTRICTION CHANGE",
      "details": "Updated C5 for U012",
      "admin": "ADMIN"
    },
    {
      "timestamp": "2026-07-30T06:29:32.605Z",
      "module": "SYSTEM",
      "action": "RESTRICTION CHANGE",
      "details": "Updated C4 for U012",
      "admin": "ADMIN"
    },
    {
      "timestamp": "2026-07-30T06:29:35.330Z",
      "module": "SYSTEM",
      "action": "RESTRICTION CHANGE",
      "details": "Updated C2 for U012",
      "admin": "ADMIN"
    },
    {
      "timestamp": "2026-07-30T06:29:38.191Z",
      "module": "SYSTEM",
      "action": "RESTRICTION CHANGE",
      "details": "Updated C7 for U012",
      "admin": "ADMIN"
    },
    {
      "timestamp": "2026-07-30T06:29:38.334Z",
      "module": "SYSTEM",
      "action": "RESTRICTION CHANGE",
      "details": "Updated C3 for U012",
      "admin": "ADMIN"
    },
    {
      "timestamp": "2026-07-30T08:00:04.206Z",
      "module": "USER_MGMT",
      "action": "EDIT USER",
      "details": "Updated User U002 (NIMMY)",
      "admin": "SYSTEM"
    },
    {
      "timestamp": "2026-07-30T08:00:14.970Z",
      "module": "SYSTEM",
      "action": "EDIT USER",
      "details": "Updated user U002",
      "admin": "ADMIN"
    },
    {
      "timestamp": "2026-07-30T08:00:49.113Z",
      "module": "USER_MGMT",
      "action": "EDIT USER",
      "details": "Updated User U002 (NIMMY)",
      "admin": "SYSTEM"
    },
    {
      "timestamp": "2026-07-30T08:00:58.898Z",
      "module": "SYSTEM",
      "action": "EDIT USER",
      "details": "Updated user U002",
      "admin": "ADMIN"
    },
    {
      "timestamp": "2026-07-30T08:03:05.590Z",
      "module": "USER_MGMT",
      "action": "EDIT USER",
      "details": "Updated User U002 (NIMMY)",
      "admin": "SYSTEM"
    },
    {
      "timestamp": "2026-07-30T08:03:16.445Z",
      "module": "SYSTEM",
      "action": "EDIT USER",
      "details": "Updated user U002",
      "admin": "ADMIN"
    },
    {
      "timestamp": "2026-07-30T08:05:01.619Z",
      "module": "USER_MGMT",
      "action": "SAVE_USERS",
      "details": "Saved record to USERS",
      "admin": "SYSTEM"
    },
    {
      "timestamp": "2026-07-30T08:05:16.013Z",
      "module": "SYSTEM",
      "action": "ADD USER",
      "details": "Created user U013 (ATHUL KRISHNA)",
      "admin": "ADMIN"
    },
    {
      "timestamp": "2026-07-30T08:06:08.727Z",
      "module": "USER_MGMT",
      "action": "EDIT USER",
      "details": "Updated User U013 (ATHUL KRISHNA)",
      "admin": "SYSTEM"
    },
    {
      "timestamp": "2026-07-30T08:06:12.809Z",
      "module": "SETTINGS",
      "action": "UPDATE_SETTINGS",
      "details": "Updated Settings for U013: Dropdown Update",
      "admin": "SYSTEM"
    },
    {
      "timestamp": "2026-07-30T08:06:14.985Z",
      "module": "SYSTEM",
      "action": "DROPDOWN SETTINGS",
      "details": "Updated settings for U013",
      "admin": "ADMIN"
    },
    {
      "timestamp": "2026-07-30T08:07:03.465Z",
      "module": "USER_MGMT",
      "action": "EDIT USER",
      "details": "Updated User U013 (ATHUL KRISHNA)",
      "admin": "SYSTEM"
    },
    {
      "timestamp": "2026-07-30T08:07:09.037Z",
      "module": "SETTINGS",
      "action": "UPDATE_SETTINGS",
      "details": "Updated Settings for U013: Dropdown Update",
      "admin": "SYSTEM"
    },
    {
      "timestamp": "2026-07-30T08:07:10.984Z",
      "module": "SYSTEM",
      "action": "DROPDOWN SETTINGS",
      "details": "Updated settings for U013",
      "admin": "ADMIN"
    },
    {
      "timestamp": "2026-07-30T08:08:04.220Z",
      "module": "USER_MGMT",
      "action": "EDIT USER",
      "details": "Updated User U013 (ATHUL KRISHNA)",
      "admin": "SYSTEM"
    },
    {
      "timestamp": "2026-07-30T08:08:08.661Z",
      "module": "SETTINGS",
      "action": "UPDATE_SETTINGS",
      "details": "Updated Settings for U013: Dropdown Update",
      "admin": "SYSTEM"
    },
    {
      "timestamp": "2026-07-30T08:08:11.404Z",
      "module": "SYSTEM",
      "action": "DROPDOWN SETTINGS",
      "details": "Updated settings for U013",
      "admin": "ADMIN"
    },
    {
      "timestamp": "2026-07-30T08:10:47.590Z",
      "module": "USER_MGMT",
      "action": "EDIT USER",
      "details": "Updated User U013 (ATHUL KRISHNA)",
      "admin": "SYSTEM"
    },
    {
      "timestamp": "2026-07-30T08:10:52.436Z",
      "module": "SETTINGS",
      "action": "UPDATE_SETTINGS",
      "details": "Updated Settings for U013: Dropdown Update",
      "admin": "SYSTEM"
    },
    {
      "timestamp": "2026-07-30T08:10:54.407Z",
      "module": "SYSTEM",
      "action": "DROPDOWN SETTINGS",
      "details": "Updated settings for U013",
      "admin": "ADMIN"
    },
    {
      "timestamp": "2026-07-31T07:58:01.932Z",
      "module": "USER_MGMT",
      "action": "EDIT USER",
      "details": "Updated User U002 (asm)",
      "admin": "SYSTEM"
    },
    {
      "timestamp": "2026-07-31T07:58:10.698Z",
      "module": "SYSTEM",
      "action": "EDIT USER",
      "details": "Updated user U002",
      "admin": "ADMIN"
    },
    {
      "timestamp": "2026-07-31T08:00:47.968Z",
      "module": "USER_MGMT",
      "action": "EDIT USER",
      "details": "Updated User U002 (NIMMY)",
      "admin": "SYSTEM"
    },
    {
      "timestamp": "2026-07-31T08:00:59.295Z",
      "module": "SYSTEM",
      "action": "EDIT USER",
      "details": "Updated user U002",
      "admin": "ADMIN"
    },
    {
      "timestamp": "2026-08-01T08:36:32.490Z",
      "module": "SETTINGS",
      "action": "UPDATE_SETTINGS",
      "details": "Updated Settings for U008: Dropdown Update",
      "admin": "SYSTEM"
    },
    {
      "timestamp": "2026-08-01T08:36:34.798Z",
      "module": "SYSTEM",
      "action": "DROPDOWN SETTINGS",
      "details": "Updated settings for U008",
      "admin": "ADMIN"
    },
    {
      "timestamp": "2026-08-01T08:37:31.722Z",
      "module": "SETTINGS",
      "action": "UPDATE_SETTINGS",
      "details": "Updated Settings for U012: Dropdown Update",
      "admin": "SYSTEM"
    },
    {
      "timestamp": "2026-08-01T08:37:34.073Z",
      "module": "SYSTEM",
      "action": "DROPDOWN SETTINGS",
      "details": "Updated settings for U012",
      "admin": "ADMIN"
    },
    {
      "timestamp": "2026-08-03T10:58:45.769Z",
      "module": "USER_MGMT",
      "action": "SAVE_USERS",
      "details": "Saved record to USERS",
      "admin": "SYSTEM"
    },
    {
      "timestamp": "2026-08-03T10:58:55.227Z",
      "module": "SYSTEM",
      "action": "ADD USER",
      "details": "Created user U014 (VENKATESAN E)",
      "admin": "ADMIN"
    },
    {
      "timestamp": "2026-08-05T09:11:04.973Z",
      "module": "USER_MGMT",
      "action": "SAVE_USERS",
      "details": "Saved record to USERS",
      "admin": "SYSTEM"
    },
    {
      "timestamp": "2026-08-05T09:11:18.816Z",
      "module": "SYSTEM",
      "action": "ADD USER",
      "details": "Created user U015 (VISHNUKUMAR)",
      "admin": "ADITHYA S MENON"
    },
    {
      "timestamp": "2026-08-05T09:11:47.803Z",
      "module": "USER_MGMT",
      "action": "SAVE_USERS",
      "details": "Saved record to USERS",
      "admin": "SYSTEM"
    },
    {
      "timestamp": "2026-08-05T09:12:03.257Z",
      "module": "SYSTEM",
      "action": "ADD USER",
      "details": "Created user U016 (VISHNU DAS)",
      "admin": "ADITHYA S MENON"
    },
    {
      "timestamp": "2026-08-05T09:58:44.656Z",
      "module": "SETTINGS",
      "action": "UPDATE_SETTINGS",
      "details": "Updated Settings for U015: Dropdown Update",
      "admin": "SYSTEM"
    },
    {
      "timestamp": "2026-08-05T09:58:47.062Z",
      "module": "SYSTEM",
      "action": "DROPDOWN SETTINGS",
      "details": "Updated settings for U015",
      "admin": "ADMIN"
    },
    {
      "timestamp": "2026-08-05T09:59:39.869Z",
      "module": "SETTINGS",
      "action": "UPDATE_SETTINGS",
      "details": "Updated Settings for U016: Dropdown Update",
      "admin": "SYSTEM"
    },
    {
      "timestamp": "2026-08-05T09:59:41.902Z",
      "module": "SYSTEM",
      "action": "DROPDOWN SETTINGS",
      "details": "Updated settings for U016",
      "admin": "ADMIN"
    },
    {
      "timestamp": "2026-08-05T10:00:50.913Z",
      "module": "SETTINGS",
      "action": "UPDATE_SETTINGS",
      "details": "Updated Settings for U015: Dropdown Update",
      "admin": "SYSTEM"
    },
    {
      "timestamp": "2026-08-05T10:00:52.886Z",
      "module": "SYSTEM",
      "action": "DROPDOWN SETTINGS",
      "details": "Updated settings for U015",
      "admin": "ADMIN"
    },
    {
      "timestamp": "2026-08-05T10:01:32.915Z",
      "module": "SETTINGS",
      "action": "UPDATE_SETTINGS",
      "details": "Updated Settings for U016: Dropdown Update",
      "admin": "SYSTEM"
    },
    {
      "timestamp": "2026-08-05T10:01:35.791Z",
      "module": "SYSTEM",
      "action": "DROPDOWN SETTINGS",
      "details": "Updated settings for U016",
      "admin": "ADMIN"
    },
    {
      "timestamp": "2026-08-05T10:03:20.504Z",
      "module": "USER_MGMT",
      "action": "EDIT USER",
      "details": "Updated User U015 (VISHNUKUMAR)",
      "admin": "SYSTEM"
    },
    {
      "timestamp": "2026-08-05T10:03:23.224Z",
      "module": "USER_MGMT",
      "action": "EDIT USER",
      "details": "Updated User U015 (VISHNUKUMAR)",
      "admin": "SYSTEM"
    },
    {
      "timestamp": "2026-08-05T10:03:26.624Z",
      "module": "USER_MGMT",
      "action": "EDIT USER",
      "details": "Updated User U015 (VISHNUKUMAR)",
      "admin": "SYSTEM"
    },
    {
      "timestamp": "2026-08-05T10:03:27.938Z",
      "module": "USER_MGMT",
      "action": "EDIT USER",
      "details": "Updated User U015 (VISHNUKUMAR)",
      "admin": "SYSTEM"
    },
    {
      "timestamp": "2026-08-05T10:03:28.826Z",
      "module": "USER_MGMT",
      "action": "EDIT USER",
      "details": "Updated User U015 (VISHNUKUMAR)",
      "admin": "SYSTEM"
    },
    {
      "timestamp": "2026-08-05T10:03:28.392Z",
      "module": "USER_MGMT",
      "action": "EDIT USER",
      "details": "Updated User U015 (VISHNUKUMAR)",
      "admin": "SYSTEM"
    },
    {
      "timestamp": "2026-08-05T10:03:30.153Z",
      "module": "USER_MGMT",
      "action": "EDIT USER",
      "details": "Updated User U015 (VISHNUKUMAR)",
      "admin": "SYSTEM"
    },
    {
      "timestamp": "2026-08-05T10:03:30.033Z",
      "module": "SYSTEM",
      "action": "RESTRICTION CHANGE",
      "details": "Updated DOWNLOAD_RESTRICTION for U015",
      "admin": "ADMIN"
    },
    {
      "timestamp": "2026-08-05T10:03:31.245Z",
      "module": "USER_MGMT",
      "action": "EDIT USER",
      "details": "Updated User U015 (VISHNUKUMAR)",
      "admin": "SYSTEM"
    },
    {
      "timestamp": "2026-08-05T10:03:30.869Z",
      "module": "SYSTEM",
      "action": "RESTRICTION CHANGE",
      "details": "Updated B2 for U015",
      "admin": "ADMIN"
    },
    {
      "timestamp": "2026-08-05T10:03:32.506Z",
      "module": "USER_MGMT",
      "action": "EDIT USER",
      "details": "Updated User U015 (VISHNUKUMAR)",
      "admin": "SYSTEM"
    },
    {
      "timestamp": "2026-08-05T10:03:33.578Z",
      "module": "USER_MGMT",
      "action": "EDIT USER",
      "details": "Updated User U015 (VISHNUKUMAR)",
      "admin": "SYSTEM"
    },
    {
      "timestamp": "2026-08-05T10:03:34.618Z",
      "module": "USER_MGMT",
      "action": "EDIT USER",
      "details": "Updated User U015 (VISHNUKUMAR)",
      "admin": "SYSTEM"
    },
    {
      "timestamp": "2026-08-05T10:03:34.327Z",
      "module": "SYSTEM",
      "action": "RESTRICTION CHANGE",
      "details": "Updated B4 for U015",
      "admin": "ADMIN"
    },
    {
      "timestamp": "2026-08-05T10:03:35.021Z",
      "module": "SYSTEM",
      "action": "RESTRICTION CHANGE",
      "details": "Updated B6 for U015",
      "admin": "ADMIN"
    },
    {
      "timestamp": "2026-08-05T10:03:35.539Z",
      "module": "SYSTEM",
      "action": "RESTRICTION CHANGE",
      "details": "Updated B5 for U015",
      "admin": "ADMIN"
    },
    {
      "timestamp": "2026-08-05T10:03:36.498Z",
      "module": "USER_MGMT",
      "action": "EDIT USER",
      "details": "Updated User U015 (VISHNUKUMAR)",
      "admin": "SYSTEM"
    },
    {
      "timestamp": "2026-08-05T10:03:37.540Z",
      "module": "USER_MGMT",
      "action": "EDIT USER",
      "details": "Updated User U015 (VISHNUKUMAR)",
      "admin": "SYSTEM"
    },
    {
      "timestamp": "2026-08-05T10:03:38.424Z",
      "module": "USER_MGMT",
      "action": "EDIT USER",
      "details": "Updated User U015 (VISHNUKUMAR)",
      "admin": "SYSTEM"
    },
    {
      "timestamp": "2026-08-05T10:03:38.642Z",
      "module": "SYSTEM",
      "action": "RESTRICTION CHANGE",
      "details": "Updated B5 for U015",
      "admin": "ADMIN"
    },
    {
      "timestamp": "2026-08-05T10:03:38.657Z",
      "module": "SYSTEM",
      "action": "RESTRICTION CHANGE",
      "details": "Updated B9 for U015",
      "admin": "ADMIN"
    },
    {
      "timestamp": "2026-08-05T10:03:39.756Z",
      "module": "USER_MGMT",
      "action": "EDIT USER",
      "details": "Updated User U015 (VISHNUKUMAR)",
      "admin": "SYSTEM"
    },
    {
      "timestamp": "2026-08-05T10:03:41.651Z",
      "module": "USER_MGMT",
      "action": "EDIT USER",
      "details": "Updated User U015 (VISHNUKUMAR)",
      "admin": "SYSTEM"
    },
    {
      "timestamp": "2026-08-05T10:03:42.074Z",
      "module": "USER_MGMT",
      "action": "EDIT USER",
      "details": "Updated User U015 (VISHNUKUMAR)",
      "admin": "SYSTEM"
    },
    {
      "timestamp": "2026-08-05T10:03:43.188Z",
      "module": "SYSTEM",
      "action": "RESTRICTION CHANGE",
      "details": "Updated A2 for U015",
      "admin": "ADMIN"
    },
    {
      "timestamp": "2026-08-05T10:03:43.924Z",
      "module": "SYSTEM",
      "action": "RESTRICTION CHANGE",
      "details": "Updated B3 for U015",
      "admin": "ADMIN"
    },
    {
      "timestamp": "2026-08-05T10:03:44.689Z",
      "module": "SYSTEM",
      "action": "RESTRICTION CHANGE",
      "details": "Updated A3 for U015",
      "admin": "ADMIN"
    },
    {
      "timestamp": "2026-08-05T10:03:45.074Z",
      "module": "SYSTEM",
      "action": "RESTRICTION CHANGE",
      "details": "Updated A5 for U015",
      "admin": "ADMIN"
    },
    {
      "timestamp": "2026-08-05T10:03:45.311Z",
      "module": "SYSTEM",
      "action": "RESTRICTION CHANGE",
      "details": "Updated B4 for U015",
      "admin": "ADMIN"
    },
    {
      "timestamp": "2026-08-05T10:03:45.475Z",
      "module": "USER_MGMT",
      "action": "EDIT USER",
      "details": "Updated User U015 (VISHNUKUMAR)",
      "admin": "SYSTEM"
    },
    {
      "timestamp": "2026-08-05T10:03:45.912Z",
      "module": "USER_MGMT",
      "action": "EDIT USER",
      "details": "Updated User U015 (VISHNUKUMAR)",
      "admin": "SYSTEM"
    },
    {
      "timestamp": "2026-08-05T10:03:46.232Z",
      "module": "SYSTEM",
      "action": "RESTRICTION CHANGE",
      "details": "Updated A4 for U015",
      "admin": "ADMIN"
    },
    {
      "timestamp": "2026-08-05T10:03:46.406Z",
      "module": "SYSTEM",
      "action": "RESTRICTION CHANGE",
      "details": "Updated B3 for U015",
      "admin": "ADMIN"
    },
    {
      "timestamp": "2026-08-05T10:03:47.565Z",
      "module": "USER_MGMT",
      "action": "EDIT USER",
      "details": "Updated User U015 (VISHNUKUMAR)",
      "admin": "SYSTEM"
    },
    {
      "timestamp": "2026-08-05T10:03:49.913Z",
      "module": "USER_MGMT",
      "action": "EDIT USER",
      "details": "Updated User U015 (VISHNUKUMAR)",
      "admin": "SYSTEM"
    },
    {
      "timestamp": "2026-08-05T10:03:50.088Z",
      "module": "USER_MGMT",
      "action": "EDIT USER",
      "details": "Updated User U015 (VISHNUKUMAR)",
      "admin": "SYSTEM"
    },
    {
      "timestamp": "2026-08-05T10:03:51.209Z",
      "module": "SYSTEM",
      "action": "RESTRICTION CHANGE",
      "details": "Updated C2 for U015",
      "admin": "ADMIN"
    },
    {
      "timestamp": "2026-08-05T10:03:51.050Z",
      "module": "SYSTEM",
      "action": "RESTRICTION CHANGE",
      "details": "Updated C1 for U015",
      "admin": "ADMIN"
    },
    {
      "timestamp": "2026-08-05T10:03:51.351Z",
      "module": "SYSTEM",
      "action": "RESTRICTION CHANGE",
      "details": "Updated A7 for U015",
      "admin": "ADMIN"
    },
    {
      "timestamp": "2026-08-05T10:03:52.783Z",
      "module": "SYSTEM",
      "action": "RESTRICTION CHANGE",
      "details": "Updated A6 for U015",
      "admin": "ADMIN"
    },
    {
      "timestamp": "2026-08-05T10:03:53.094Z",
      "module": "USER_MGMT",
      "action": "EDIT USER",
      "details": "Updated User U015 (VISHNUKUMAR)",
      "admin": "SYSTEM"
    },
    {
      "timestamp": "2026-08-05T10:03:53.006Z",
      "module": "USER_MGMT",
      "action": "EDIT USER",
      "details": "Updated User U015 (VISHNUKUMAR)",
      "admin": "SYSTEM"
    },
    {
      "timestamp": "2026-08-05T10:03:54.563Z",
      "module": "USER_MGMT",
      "action": "EDIT USER",
      "details": "Updated User U015 (VISHNUKUMAR)",
      "admin": "SYSTEM"
    },
    {
      "timestamp": "2026-08-05T10:03:56.463Z",
      "module": "SYSTEM",
      "action": "RESTRICTION CHANGE",
      "details": "Updated C for U015",
      "admin": "ADMIN"
    },
    {
      "timestamp": "2026-08-05T10:03:56.751Z",
      "module": "SYSTEM",
      "action": "RESTRICTION CHANGE",
      "details": "Updated C4 for U015",
      "admin": "ADMIN"
    },
    {
      "timestamp": "2026-08-05T10:03:59.633Z",
      "module": "SYSTEM",
      "action": "RESTRICTION CHANGE",
      "details": "Updated C3 for U015",
      "admin": "ADMIN"
    },
    {
      "timestamp": "2026-08-05T10:04:02.249Z",
      "module": "SYSTEM",
      "action": "RESTRICTION CHANGE",
      "details": "Updated C6 for U015",
      "admin": "ADMIN"
    },
    {
      "timestamp": "2026-08-05T10:04:02.058Z",
      "module": "SYSTEM",
      "action": "RESTRICTION CHANGE",
      "details": "Updated C7 for U015",
      "admin": "ADMIN"
    },
    {
      "timestamp": "2026-08-05T10:04:02.608Z",
      "module": "SYSTEM",
      "action": "RESTRICTION CHANGE",
      "details": "Updated C5 for U015",
      "admin": "ADMIN"
    },
    {
      "timestamp": "2026-08-05T10:04:04.417Z",
      "module": "USER_MGMT",
      "action": "EDIT USER",
      "details": "Updated User U016 (VISHNU DAS)",
      "admin": "SYSTEM"
    },
    {
      "timestamp": "2026-08-05T10:04:05.680Z",
      "module": "USER_MGMT",
      "action": "EDIT USER",
      "details": "Updated User U016 (VISHNU DAS)",
      "admin": "SYSTEM"
    },
    {
      "timestamp": "2026-08-05T10:04:07.681Z",
      "module": "USER_MGMT",
      "action": "EDIT USER",
      "details": "Updated User U016 (VISHNU DAS)",
      "admin": "SYSTEM"
    },
    {
      "timestamp": "2026-08-05T10:04:08.641Z",
      "module": "USER_MGMT",
      "action": "EDIT USER",
      "details": "Updated User U016 (VISHNU DAS)",
      "admin": "SYSTEM"
    },
    {
      "timestamp": "2026-08-05T10:04:09.527Z",
      "module": "USER_MGMT",
      "action": "EDIT USER",
      "details": "Updated User U016 (VISHNU DAS)",
      "admin": "SYSTEM"
    },
    {
      "timestamp": "2026-08-05T10:04:10.697Z",
      "module": "USER_MGMT",
      "action": "EDIT USER",
      "details": "Updated User U016 (VISHNU DAS)",
      "admin": "SYSTEM"
    },
    {
      "timestamp": "2026-08-05T10:04:11.947Z",
      "module": "USER_MGMT",
      "action": "EDIT USER",
      "details": "Updated User U016 (VISHNU DAS)",
      "admin": "SYSTEM"
    },
    {
      "timestamp": "2026-08-05T10:04:12.378Z",
      "module": "SYSTEM",
      "action": "RESTRICTION CHANGE",
      "details": "Updated A2 for U016",
      "admin": "ADMIN"
    },
    {
      "timestamp": "2026-08-05T10:04:12.975Z",
      "module": "USER_MGMT",
      "action": "EDIT USER",
      "details": "Updated User U016 (VISHNU DAS)",
      "admin": "SYSTEM"
    },
    {
      "timestamp": "2026-08-05T10:04:14.339Z",
      "module": "USER_MGMT",
      "action": "EDIT USER",
      "details": "Updated User U016 (VISHNU DAS)",
      "admin": "SYSTEM"
    },
    {
      "timestamp": "2026-08-05T10:04:14.665Z",
      "module": "SYSTEM",
      "action": "RESTRICTION CHANGE",
      "details": "Updated A3 for U016",
      "admin": "ADMIN"
    },
    {
      "timestamp": "2026-08-05T10:04:14.947Z",
      "module": "SYSTEM",
      "action": "RESTRICTION CHANGE",
      "details": "Updated A6 for U016",
      "admin": "ADMIN"
    },
    {
      "timestamp": "2026-08-05T10:04:15.396Z",
      "module": "SYSTEM",
      "action": "RESTRICTION CHANGE",
      "details": "Updated A5 for U016",
      "admin": "ADMIN"
    },
    {
      "timestamp": "2026-08-05T10:04:15.447Z",
      "module": "USER_MGMT",
      "action": "EDIT USER",
      "details": "Updated User U016 (VISHNU DAS)",
      "admin": "SYSTEM"
    },
    {
      "timestamp": "2026-08-05T10:04:16.745Z",
      "module": "USER_MGMT",
      "action": "EDIT USER",
      "details": "Updated User U016 (VISHNU DAS)",
      "admin": "SYSTEM"
    },
    {
      "timestamp": "2026-08-05T10:04:17.530Z",
      "module": "USER_MGMT",
      "action": "EDIT USER",
      "details": "Updated User U016 (VISHNU DAS)",
      "admin": "SYSTEM"
    },
    {
      "timestamp": "2026-08-05T10:04:18.723Z",
      "module": "USER_MGMT",
      "action": "EDIT USER",
      "details": "Updated User U016 (VISHNU DAS)",
      "admin": "SYSTEM"
    },
    {
      "timestamp": "2026-08-05T10:04:18.989Z",
      "module": "SYSTEM",
      "action": "RESTRICTION CHANGE",
      "details": "Updated B3 for U016",
      "admin": "ADMIN"
    },
    {
      "timestamp": "2026-08-05T10:04:20.254Z",
      "module": "SYSTEM",
      "action": "RESTRICTION CHANGE",
      "details": "Updated A4 for U016",
      "admin": "ADMIN"
    },
    {
      "timestamp": "2026-08-05T10:04:21.148Z",
      "module": "SYSTEM",
      "action": "RESTRICTION CHANGE",
      "details": "Updated B4 for U016",
      "admin": "ADMIN"
    },
    {
      "timestamp": "2026-08-05T10:04:22.243Z",
      "module": "USER_MGMT",
      "action": "EDIT USER",
      "details": "Updated User U016 (VISHNU DAS)",
      "admin": "SYSTEM"
    },
    {
      "timestamp": "2026-08-05T10:04:22.275Z",
      "module": "SYSTEM",
      "action": "RESTRICTION CHANGE",
      "details": "Updated A7 for U016",
      "admin": "ADMIN"
    },
    {
      "timestamp": "2026-08-05T10:04:23.002Z",
      "module": "SYSTEM",
      "action": "RESTRICTION CHANGE",
      "details": "Updated B5 for U016",
      "admin": "ADMIN"
    },
    {
      "timestamp": "2026-08-05T10:04:22.854Z",
      "module": "SYSTEM",
      "action": "RESTRICTION CHANGE",
      "details": "Updated B8 for U016",
      "admin": "ADMIN"
    },
    {
      "timestamp": "2026-08-05T10:04:23.806Z",
      "module": "USER_MGMT",
      "action": "EDIT USER",
      "details": "Updated User U016 (VISHNU DAS)",
      "admin": "SYSTEM"
    },
    {
      "timestamp": "2026-08-05T10:04:24.891Z",
      "module": "USER_MGMT",
      "action": "EDIT USER",
      "details": "Updated User U016 (VISHNU DAS)",
      "admin": "SYSTEM"
    },
    {
      "timestamp": "2026-08-05T10:04:25.987Z",
      "module": "USER_MGMT",
      "action": "EDIT USER",
      "details": "Updated User U016 (VISHNU DAS)",
      "admin": "SYSTEM"
    },
    {
      "timestamp": "2026-08-05T10:04:27.023Z",
      "module": "USER_MGMT",
      "action": "EDIT USER",
      "details": "Updated User U016 (VISHNU DAS)",
      "admin": "SYSTEM"
    },
    {
      "timestamp": "2026-08-05T10:04:26.847Z",
      "module": "SYSTEM",
      "action": "RESTRICTION CHANGE",
      "details": "Updated B6 for U016",
      "admin": "ADMIN"
    },
    {
      "timestamp": "2026-08-05T10:04:26.900Z",
      "module": "SYSTEM",
      "action": "RESTRICTION CHANGE",
      "details": "Updated B2 for U016",
      "admin": "ADMIN"
    },
    {
      "timestamp": "2026-08-05T10:04:28.381Z",
      "module": "USER_MGMT",
      "action": "EDIT USER",
      "details": "Updated User U016 (VISHNU DAS)",
      "admin": "SYSTEM"
    },
    {
      "timestamp": "2026-08-05T10:04:28.651Z",
      "module": "USER_MGMT",
      "action": "EDIT USER",
      "details": "Updated User U016 (VISHNU DAS)",
      "admin": "SYSTEM"
    },
    {
      "timestamp": "2026-08-05T10:04:29.149Z",
      "module": "SYSTEM",
      "action": "RESTRICTION CHANGE",
      "details": "Updated B9 for U016",
      "admin": "ADMIN"
    },
    {
      "timestamp": "2026-08-05T10:04:30.039Z",
      "module": "USER_MGMT",
      "action": "EDIT USER",
      "details": "Updated User U016 (VISHNU DAS)",
      "admin": "SYSTEM"
    },
    {
      "timestamp": "2026-08-05T10:04:29.861Z",
      "module": "SYSTEM",
      "action": "RESTRICTION CHANGE",
      "details": "Updated C1 for U016",
      "admin": "ADMIN"
    },
    {
      "timestamp": "2026-08-05T10:04:31.583Z",
      "module": "USER_MGMT",
      "action": "EDIT USER",
      "details": "Updated User U016 (VISHNU DAS)",
      "admin": "SYSTEM"
    },
    {
      "timestamp": "2026-08-05T10:04:32.197Z",
      "module": "USER_MGMT",
      "action": "EDIT USER",
      "details": "Updated User U016 (VISHNU DAS)",
      "admin": "SYSTEM"
    },
    {
      "timestamp": "2026-08-05T10:04:34.526Z",
      "module": "SYSTEM",
      "action": "RESTRICTION CHANGE",
      "details": "Updated C3 for U016",
      "admin": "ADMIN"
    },
    {
      "timestamp": "2026-08-05T10:04:34.326Z",
      "module": "SYSTEM",
      "action": "RESTRICTION CHANGE",
      "details": "Updated C2 for U016",
      "admin": "ADMIN"
    },
    {
      "timestamp": "2026-08-05T10:04:35.866Z",
      "module": "USER_MGMT",
      "action": "EDIT USER",
      "details": "Updated User U016 (VISHNU DAS)",
      "admin": "SYSTEM"
    },
    {
      "timestamp": "2026-08-05T10:04:36.874Z",
      "module": "SYSTEM",
      "action": "RESTRICTION CHANGE",
      "details": "Updated C7 for U016",
      "admin": "ADMIN"
    },
    {
      "timestamp": "2026-08-05T10:04:37.748Z",
      "module": "SYSTEM",
      "action": "RESTRICTION CHANGE",
      "details": "Updated C4 for U016",
      "admin": "ADMIN"
    },
    {
      "timestamp": "2026-08-05T10:04:39.518Z",
      "module": "SYSTEM",
      "action": "RESTRICTION CHANGE",
      "details": "Updated C6 for U016",
      "admin": "ADMIN"
    },
    {
      "timestamp": "2026-08-05T10:04:40.561Z",
      "module": "SYSTEM",
      "action": "RESTRICTION CHANGE",
      "details": "Updated C for U016",
      "admin": "ADMIN"
    },
    {
      "timestamp": "2026-08-05T10:04:40.986Z",
      "module": "SYSTEM",
      "action": "RESTRICTION CHANGE",
      "details": "Updated C5 for U016",
      "admin": "ADMIN"
    },
    {
      "timestamp": "2026-08-05T10:04:41.219Z",
      "module": "SYSTEM",
      "action": "RESTRICTION CHANGE",
      "details": "Updated C5 for U016",
      "admin": "ADMIN"
    },
    {
      "timestamp": "2026-08-05T10:04:41.626Z",
      "module": "SYSTEM",
      "action": "RESTRICTION CHANGE",
      "details": "Updated C6 for U016",
      "admin": "ADMIN"
    },
    {
      "timestamp": "2026-08-05T10:04:43.515Z",
      "module": "SYSTEM",
      "action": "RESTRICTION CHANGE",
      "details": "Updated C3 for U016",
      "admin": "ADMIN"
    },
    {
      "timestamp": "2026-08-05T10:04:44.292Z",
      "module": "SYSTEM",
      "action": "RESTRICTION CHANGE",
      "details": "Updated C4 for U016",
      "admin": "ADMIN"
    },
    {
      "timestamp": "2026-08-07T05:37:42.301Z",
      "module": "SETTINGS",
      "action": "UPDATE_SETTINGS",
      "details": "Updated Settings for U012: Dropdown Update",
      "admin": "SYSTEM"
    },
    {
      "timestamp": "2026-08-07T05:37:45.573Z",
      "module": "SYSTEM",
      "action": "DROPDOWN SETTINGS",
      "details": "Updated settings for U012",
      "admin": "ADMIN"
    },
    {
      "timestamp": "2026-08-07T05:39:31.125Z",
      "module": "SETTINGS",
      "action": "UPDATE_SETTINGS",
      "details": "Updated Settings for U008: Dropdown Update",
      "admin": "SYSTEM"
    },
    {
      "timestamp": "2026-08-07T05:39:33.708Z",
      "module": "SYSTEM",
      "action": "DROPDOWN SETTINGS",
      "details": "Updated settings for U008",
      "admin": "ADMIN"
    },
    {
      "timestamp": "2026-08-12T12:00:34.131Z",
      "module": "USER_MGMT",
      "action": "EDIT USER",
      "details": "Updated User U012 (PRATHEEKSHA)",
      "admin": "SYSTEM"
    },
    {
      "timestamp": "2026-08-12T12:00:40.811Z",
      "module": "SYSTEM",
      "action": "RESTRICTION CHANGE",
      "details": "Updated DOWNLOAD_RESTRICTION for U012",
      "admin": "ADMIN"
    },
    {
      "timestamp": "2026-09-01T11:17:38.364Z",
      "module": "USER_MGMT",
      "action": "EDIT USER",
      "details": "Updated User U008 (SONY LENIN)",
      "admin": "SYSTEM"
    },
    {
      "timestamp": "2026-09-01T11:17:39.385Z",
      "module": "USER_MGMT",
      "action": "EDIT USER",
      "details": "Updated User U008 (SONY LENIN)",
      "admin": "SYSTEM"
    },
    {
      "timestamp": "2026-09-01T11:17:47.352Z",
      "module": "SYSTEM",
      "action": "RESTRICTION CHANGE",
      "details": "Updated A8 for U008",
      "admin": "ADMIN"
    },
    {
      "timestamp": "2026-09-01T11:17:47.331Z",
      "module": "USER_MGMT",
      "action": "EDIT USER",
      "details": "Updated User U010 (SARI SATHYAN)",
      "admin": "SYSTEM"
    },
    {
      "timestamp": "2026-09-01T11:17:48.732Z",
      "module": "USER_MGMT",
      "action": "EDIT USER",
      "details": "Updated User U010 (SARI SATHYAN)",
      "admin": "SYSTEM"
    },
    {
      "timestamp": "2026-09-01T11:17:51.927Z",
      "module": "SYSTEM",
      "action": "RESTRICTION CHANGE",
      "details": "Updated B10 for U008",
      "admin": "ADMIN"
    },
    {
      "timestamp": "2026-09-01T11:17:53.160Z",
      "module": "USER_MGMT",
      "action": "EDIT USER",
      "details": "Updated User U013 (ATHUL KRISHNA)",
      "admin": "SYSTEM"
    },
    {
      "timestamp": "2026-09-01T11:17:54.251Z",
      "module": "USER_MGMT",
      "action": "EDIT USER",
      "details": "Updated User U013 (ATHUL KRISHNA)",
      "admin": "SYSTEM"
    },
    {
      "timestamp": "2026-09-01T11:17:56.000Z",
      "module": "USER_MGMT",
      "action": "EDIT USER",
      "details": "Updated User U013 (ATHUL KRISHNA)",
      "admin": "SYSTEM"
    },
    {
      "timestamp": "2026-09-01T11:17:58.909Z",
      "module": "SYSTEM",
      "action": "RESTRICTION CHANGE",
      "details": "Updated A8 for U010",
      "admin": "ADMIN"
    },
    {
      "timestamp": "2026-09-01T11:18:01.883Z",
      "module": "USER_MGMT",
      "action": "EDIT USER",
      "details": "Updated User U012 (PRATHEEKSHA)",
      "admin": "SYSTEM"
    },
    {
      "timestamp": "2026-09-01T11:18:02.246Z",
      "module": "USER_MGMT",
      "action": "EDIT USER",
      "details": "Updated User U012 (PRATHEEKSHA)",
      "admin": "SYSTEM"
    },
    {
      "timestamp": "2026-09-01T11:18:02.834Z",
      "module": "SYSTEM",
      "action": "RESTRICTION CHANGE",
      "details": "Updated B10 for U010",
      "admin": "ADMIN"
    },
    {
      "timestamp": "2026-09-01T11:18:04.065Z",
      "module": "SYSTEM",
      "action": "RESTRICTION CHANGE",
      "details": "Updated A for U013",
      "admin": "ADMIN"
    },
    {
      "timestamp": "2026-09-01T11:18:04.374Z",
      "module": "SYSTEM",
      "action": "RESTRICTION CHANGE",
      "details": "Updated B for U013",
      "admin": "ADMIN"
    },
    {
      "timestamp": "2026-09-01T11:18:06.002Z",
      "module": "SYSTEM",
      "action": "RESTRICTION CHANGE",
      "details": "Updated C for U013",
      "admin": "ADMIN"
    },
    {
      "timestamp": "2026-09-01T11:18:11.564Z",
      "module": "SYSTEM",
      "action": "RESTRICTION CHANGE",
      "details": "Updated A8 for U012",
      "admin": "ADMIN"
    },
    {
      "timestamp": "2026-09-01T11:18:11.893Z",
      "module": "SYSTEM",
      "action": "RESTRICTION CHANGE",
      "details": "Updated B10 for U012",
      "admin": "ADMIN"
    },
    {
      "timestamp": "2026-09-01T11:18:12.698Z",
      "module": "USER_MGMT",
      "action": "EDIT USER",
      "details": "Updated User U016 (VISHNU DAS)",
      "admin": "SYSTEM"
    },
    {
      "timestamp": "2026-09-01T11:18:14.544Z",
      "module": "USER_MGMT",
      "action": "EDIT USER",
      "details": "Updated User U016 (VISHNU DAS)",
      "admin": "SYSTEM"
    },
    {
      "timestamp": "2026-09-01T11:18:20.275Z",
      "module": "SYSTEM",
      "action": "RESTRICTION CHANGE",
      "details": "Updated A8 for U016",
      "admin": "ADMIN"
    },
    {
      "timestamp": "2026-09-01T11:18:26.365Z",
      "module": "SYSTEM",
      "action": "RESTRICTION CHANGE",
      "details": "Updated B10 for U016",
      "admin": "ADMIN"
    },
    {
      "timestamp": "2026-09-08T11:58:12.005Z",
      "module": "USER_MGMT",
      "action": "EDIT USER",
      "details": "Updated User U013 (ATHUL KRISHNA)",
      "admin": "SYSTEM"
    },
    {
      "timestamp": "2026-09-08T11:58:19.661Z",
      "module": "SETTINGS",
      "action": "UPDATE_SETTINGS",
      "details": "Updated Settings for U013: Dropdown Update",
      "admin": "SYSTEM"
    },
    {
      "timestamp": "2026-09-08T11:58:21.724Z",
      "module": "SYSTEM",
      "action": "DROPDOWN SETTINGS",
      "details": "Updated settings for U013",
      "admin": "ADMIN"
    },
    {
      "timestamp": "2026-09-08T12:49:23.422Z",
      "module": "USER_MGMT",
      "action": "EDIT USER",
      "details": "Updated User U013 (ATHUL KRISHNA)",
      "admin": "SYSTEM"
    },
    {
      "timestamp": "2026-09-08T12:49:32.371Z",
      "module": "SETTINGS",
      "action": "UPDATE_SETTINGS",
      "details": "Updated Settings for U013: Dropdown Update",
      "admin": "SYSTEM"
    },
    {
      "timestamp": "2026-09-08T12:49:35.172Z",
      "module": "SYSTEM",
      "action": "DROPDOWN SETTINGS",
      "details": "Updated settings for U013",
      "admin": "ADMIN"
    },
    {
      "timestamp": "2026-09-18T04:12:40.269Z",
      "module": "USER_MGMT",
      "action": "EDIT USER",
      "details": "Updated User U016 (VISHNU DAS)",
      "admin": "SYSTEM"
    },
    {
      "timestamp": "2026-09-18T04:13:07.566Z",
      "module": "SYSTEM",
      "action": "EDIT USER",
      "details": "Updated user U016",
      "admin": "ADMIN"
    },
    {
      "timestamp": "2026-09-18T04:14:32.439Z",
      "module": "USER_MGMT",
      "action": "EDIT USER",
      "details": "Updated User U016 (VARALAKSHMI)",
      "admin": "SYSTEM"
    },
    {
      "timestamp": "2026-09-23T05:14:04.802Z",
      "module": "SETTINGS",
      "action": "UPDATE_SETTINGS",
      "details": "Updated Settings for U008: Dropdown Update",
      "admin": "SYSTEM"
    },
    {
      "timestamp": "2026-09-23T05:14:08.002Z",
      "module": "SYSTEM",
      "action": "DROPDOWN SETTINGS",
      "details": "Updated settings for U008",
      "admin": "ADITHYA S MENON"
    },
    {
      "timestamp": "2026-09-23T05:15:11.877Z",
      "module": "SETTINGS",
      "action": "UPDATE_SETTINGS",
      "details": "Updated Settings for U016: Dropdown Update",
      "admin": "SYSTEM"
    },
    {
      "timestamp": "2026-09-23T05:15:14.004Z",
      "module": "SYSTEM",
      "action": "DROPDOWN SETTINGS",
      "details": "Updated settings for U016",
      "admin": "ADITHYA S MENON"
    },
    {
      "timestamp": "2026-09-23T05:15:59.035Z",
      "module": "SETTINGS",
      "action": "UPDATE_SETTINGS",
      "details": "Updated Settings for U012: Dropdown Update",
      "admin": "SYSTEM"
    },
    {
      "timestamp": "2026-09-23T05:16:01.754Z",
      "module": "SYSTEM",
      "action": "DROPDOWN SETTINGS",
      "details": "Updated settings for U012",
      "admin": "ADITHYA S MENON"
    },
    {
      "timestamp": "2026-09-23T10:35:18.541Z",
      "module": "USER_MGMT",
      "action": "EDIT USER",
      "details": "Updated User U016 (KUMAR)",
      "admin": "SYSTEM"
    },
    {
      "timestamp": "2026-09-23T10:35:32.410Z",
      "module": "SYSTEM",
      "action": "EDIT USER",
      "details": "Updated user U016 (KUMAR)",
      "admin": "ADITHYA S MENON"
    },
    {
      "timestamp": "2026-09-23T10:35:49.748Z",
      "module": "USER_MGMT",
      "action": "EDIT USER",
      "details": "Updated User U016 (VARALAKSHMI)",
      "admin": "SYSTEM"
    },
    {
      "timestamp": "2026-09-23T10:35:59.794Z",
      "module": "SYSTEM",
      "action": "EDIT USER",
      "details": "Updated user U016 (VARALAKSHMI)",
      "admin": "ADITHYA S MENON"
    }
  ],
  "settings": {
    "GLOBAL": {
      "ZONE": [
        "KERALA",
        "TIRUPUR",
        "BANGALORE"
      ],
      "UNIT": [
        "MUVATTUPUZHA",
        "ANGAMALY",
        "RAW MATERIAL STORE",
        "RAW MATERIAL STORE - TUP",
        "RAW MATERIAL STORE - BNGLR"
      ],
      "SUPPLIER": [],
      "ITEMS": [],
      "COLOR": [
        "BLACK",
        "WHITE",
        "NUDE",
        "MIXED",
        "NAVY",
        "RED",
        "GREEN",
        "GREY",
        "BLUE",
        "SKIN",
        "MAROON"
      ],
      "SIZE": [
        "30",
        "32",
        "34",
        "36",
        "38",
        "40",
        "42",
        "44",
        "46",
        "S",
        "M",
        "L",
        "XL",
        "28",
        "XS",
        "XXL"
      ],
      "CUPSIZE": [
        "B",
        "C",
        "D",
        "E",
        "F",
        "G",
        "A"
      ],
      "DEFECTS": [
        "STAIN",
        "HOLE",
        "SHADING",
        "BROKEN STITCH",
        "SHADE VARIATION",
        "MEASUREMENT",
        "NEEDLE CUT",
        "SKIP STITCH",
        "DIRTY MARK",
        "OPEN SEAM",
        "PUCKERING",
        "OIL STAIN",
        "UNEVEN HEM",
        "RAW EDGE",
        "OTHER"
      ],
      "OPERATION": [
        "OP 1",
        "OP 2",
        "FRONT ATTACH",
        "BACK ATTACH",
        "SLEEVE ATTACH",
        "HEMMING",
        "NECK ATTACH",
        "CUP ATTACH",
        "STRAP ATTACH",
        "BOTTOM ELASTIC",
        "LABEL ATTACH",
        "SIDE SEAM",
        "HOOK & EYE ATTACH",
        "OTHER"
      ],
      "MACHINE": [
        "M001",
        "M002",
        "SNLS",
        "DNLS",
        "O/L",
        "F/L",
        "K/S",
        "BARTACK",
        "ZIGZAG",
        "FEED OF ARM",
        "BUTTON HOLE",
        "OTHER"
      ],
      "WORKERS": [
        "WORKER 1",
        "WORKER 2",
        "WORKER 3",
        "WORKER 4",
        "WORKER 5"
      ],
      "LINE": [
        "LINE 1",
        "LINE 2",
        "LINE 3",
        "LINE 4",
        "LINE 5",
        "SAMPLE ROOM",
        "TRAINING LINE"
      ],
      "STYLE_NAME": [
        "A 6",
        "A6 THIN",
        "ABSOLUTE PLUS",
        "AUTHENTIC BRA",
        "BRIDAL FOAM",
        "CARE U",
        "CIRCET BRA",
        "COOL FOAM",
        "ESSENTIAL BRA",
        "ETHNIC BRA",
        "FAVOURITE",
        "FULL MOON",
        "HAKO DSA",
        "HAKO LIFT",
        "HONEST BRA",
        "JASMINE",
        "LOVELY PAD",
        "MADAMS",
        "MAGNA FIT",
        "MAX SUPPORT",
        "MERCY SSU",
        "PLUS SIZE",
        "PRETTY PLUS",
        "PRIYA MOHINI",
        "PRIYA SAJINI",
        "PRIYA SP",
        "RINGLET",
        "RUBY",
        "SAREE BRA",
        "STYLE 1",
        "STYLE 2",
        "STYLE A",
        "STYLE B",
        "STYLE C",
        "TRUST ME",
        "TUNIC DSA",
        "WELL SUPPORT",
        "WOVEN RINGS"
      ],
      "ZONES": [
        "KERALA",
        "TIRUPUR",
        "BANGALORE"
      ],
      "UNITS": [
        "MUVATTUPUZHA",
        "ANGAMALY",
        "RAW MATERIAL STORE",
        "RAW MATERIAL STORE - TUP",
        "RAW MATERIAL STORE - BNGLR"
      ],
      "SUPPLIERS": []
    },
    "SETTINGS": {
      "ZONE": [
        "KERALA",
        "TIRUPUR",
        "BANGALORE"
      ],
      "UNIT": [
        "MUVATTUPUZHA",
        "ANGAMALY",
        "RAW MATERIAL STORE",
        "RAW MATERIAL STORE - TUP",
        "RAW MATERIAL STORE - BNGLR"
      ],
      "SUPPLIER": [],
      "ITEMS": [],
      "COLOR": [
        "BLACK",
        "WHITE",
        "NUDE",
        "MIXED",
        "NAVY",
        "RED",
        "GREEN",
        "GREY",
        "BLUE",
        "SKIN",
        "MAROON"
      ],
      "SIZE": [
        "30",
        "32",
        "34",
        "36",
        "38",
        "40",
        "42",
        "44",
        "46",
        "S",
        "M",
        "L",
        "XL",
        "28",
        "XS",
        "XXL"
      ],
      "CUPSIZE": [
        "B",
        "C",
        "D",
        "E",
        "F",
        "G",
        "A"
      ],
      "DEFECTS": [
        "STAIN",
        "HOLE",
        "SHADING",
        "BROKEN STITCH",
        "SHADE VARIATION",
        "MEASUREMENT",
        "NEEDLE CUT",
        "SKIP STITCH",
        "DIRTY MARK",
        "OPEN SEAM",
        "PUCKERING",
        "OIL STAIN",
        "UNEVEN HEM",
        "RAW EDGE",
        "OTHER"
      ],
      "OPERATION": [
        "OP 1",
        "OP 2",
        "FRONT ATTACH",
        "BACK ATTACH",
        "SLEEVE ATTACH",
        "HEMMING",
        "NECK ATTACH",
        "CUP ATTACH",
        "STRAP ATTACH",
        "BOTTOM ELASTIC",
        "LABEL ATTACH",
        "SIDE SEAM",
        "HOOK & EYE ATTACH",
        "OTHER"
      ],
      "MACHINE": [
        "M001",
        "M002",
        "SNLS",
        "DNLS",
        "O/L",
        "F/L",
        "K/S",
        "BARTACK",
        "ZIGZAG",
        "FEED OF ARM",
        "BUTTON HOLE",
        "OTHER"
      ],
      "WORKERS": [
        "WORKER 1",
        "WORKER 2",
        "WORKER 3",
        "WORKER 4",
        "WORKER 5"
      ],
      "LINE": [
        "LINE 1",
        "LINE 2",
        "LINE 3",
        "LINE 4",
        "LINE 5",
        "SAMPLE ROOM",
        "TRAINING LINE"
      ],
      "STYLE_NAME": [
        "A 6",
        "A6 THIN",
        "ABSOLUTE PLUS",
        "AUTHENTIC BRA",
        "BRIDAL FOAM",
        "CARE U",
        "CIRCET BRA",
        "COOL FOAM",
        "ESSENTIAL BRA",
        "ETHNIC BRA",
        "FAVOURITE",
        "FULL MOON",
        "HAKO DSA",
        "HAKO LIFT",
        "HONEST BRA",
        "JASMINE",
        "LOVELY PAD",
        "MADAMS",
        "MAGNA FIT",
        "MAX SUPPORT",
        "MERCY SSU",
        "PLUS SIZE",
        "PRETTY PLUS",
        "PRIYA MOHINI",
        "PRIYA SAJINI",
        "PRIYA SP",
        "RINGLET",
        "RUBY",
        "SAREE BRA",
        "STYLE 1",
        "STYLE 2",
        "STYLE A",
        "STYLE B",
        "STYLE C",
        "TRUST ME",
        "TUNIC DSA",
        "WELL SUPPORT",
        "WOVEN RINGS"
      ],
      "ZONES": [
        "KERALA",
        "TIRUPUR",
        "BANGALORE"
      ],
      "UNITS": [
        "MUVATTUPUZHA",
        "ANGAMALY",
        "RAW MATERIAL STORE",
        "RAW MATERIAL STORE - TUP",
        "RAW MATERIAL STORE - BNGLR"
      ],
      "SUPPLIERS": []
    },
    "ZONE": [
      "KERALA",
      "TIRUPUR",
      "BANGALORE"
    ],
    "UNIT": [
      "MUVATTUPUZHA",
      "ANGAMALY",
      "RAW MATERIAL STORE",
      "RAW MATERIAL STORE - TUP",
      "RAW MATERIAL STORE - BNGLR"
    ],
    "SUPPLIER": [
      "A S MILLS",
      "A S TRADERS",
      "AAP KNIT FABS",
      "ADMIX CREATIONS LLP",
      "ADONIS INTEX",
      "AISWARYA POLYFLEX PVT LTD",
      "AMPIO INDUSTRIES LLP",
      "ANASWARA OFFSET (P) LTD",
      "ANASWARA POLYFLEX",
      "ASIAN TRADING COMPANY",
      "ASSOCIATED CLOTHINGS",
      "ATOZ PACKAGINGS AND PRINTING PRIVATE LIMITED",
      "AURAM EXPORTS AND IMPORTS",
      "Amba Linen Fabs",
      "B R ELASTICS INDIA PRIVATE LIMITED",
      "BALAJI FABIANA VENTURES LLP",
      "BALAJI METALING",
      "BALAJI TRADING CO - AHMEDABAD",
      "BANNARI AMMAN PRINTING",
      "BANNARI AMMAN SPINNING MILLS LIMITED",
      "BASKER",
      "BEEKAY FOAMS",
      "BHAVANI TECH PACK",
      "BIRLA ADVANCED KNITS PRIVATE LIMITED",
      "BTA ELASTICS",
      "C R INDUSTRIAL INDIA",
      "CHIRAG KNIT FAB",
      "CHOLAA COLOUR TEC",
      "CHOLAA TAPES",
      "CLASSIC PACKAGING",
      "CONSOLIDATED THERMOPLASTIC PRODUCT (P) LTD",
      "CORAL BLUE TEX",
      "COTTON BLOSSOM (INDIA) PRIVATE LIMITED",
      "CUP COUTURE-CHENNAI",
      "DALAVAYI TEXTILES",
      "DEVDEEP TEX FAB PRIVATE LIMITED",
      "DEVGURU TAPE INDUSTRIES",
      "DHANVI INTIMATES",
      "DHARMIKA ENTERPRISES",
      "DIAMOND CARTON INDUSTRIES",
      "DIVYA IMPEX",
      "EBENEZER PRESS PRIVATE LIMITED",
      "EBENEZER PRINTPACK(P) LTD",
      "ETHAN PACKERS PVT LTD",
      "EXIM KNITS PVT LTD",
      "FABRICA IMPEX",
      "FABTECH INTERNATIONAL HOSIERIES PRIVATE LIMITED",
      "FAIR TRADE - MUVATTUPUZHA",
      "FASHION ELASTIC",
      "FINE OFFSET PRINTERS",
      "FINIX LABELS PRIVATE LIMITED",
      "FIRMA HOOK TECH P LTD",
      "FIVE STAR OFFSET PRINTERS",
      "FLEXCON ELASTOMERICS",
      "FOCUS TEXTILES",
      "FRESH FEEL APPARELS",
      "Fastech S&S India Private Limited",
      "G J TRADERS",
      "G M S PROCESSORS (P) LTD",
      "G P YARNS",
      "GINZA INDUSTRIES",
      "GINZA INDUSTRIES LTD",
      "GOOD LUCK ENTERPRISES",
      "HAMPRIGO INDUSTRIES",
      "HANUMAN DYEING",
      "HI FASHIONS INDUSTRIES PRIVATE LIMITED",
      "HIGH KNITS GLOBAL",
      "HILLSILVER EXPORTSS",
      "HY-MAXX PACKAGING - KORATTY",
      "INDIAN TRADE EMPORIUM",
      "INNOVATIVE COLOURS",
      "INTERTECH IMPRESSIONS - BANGALORE",
      "INTICEDE BSD PRIVATE LIMITED",
      "J B FABRICS",
      "J K ENTERPRISES",
      "J S FASHION ACCESSORIES",
      "J V TAPES",
      "JAIN NARROW FABS",
      "JK POLY FABRICS",
      "JOMY TRADERS",
      "JULIET INDUSTRIES PVT LTD",
      "JYOTHI INTERFAB",
      "KAKADIYA ENTERPRISE",
      "KAKADIYA INDUSTRIES",
      "KAMSRI PRINTING & PACKAGING PVT LTD",
      "KIRAN POLYPLAST",
      "KIRAN TEXPRO PVT LTD",
      "KNITS INDIA",
      "KOMAL LIFESTYLE PRIVATE LIMITED - AHMEDABAD",
      "KOMAL TEX FAB",
      "KONIKA",
      "KONIKA ELASTICS PRIVATE LIMITED",
      "KONIKA INTIMA PRIVATE LIMITED",
      "KONIKA TAPES PRIVATE LIMITED",
      "KOTAK OVERSEAS(P) LTD",
      "KOTAK SALES CORPORATION",
      "KRISHNA IMPEX",
      "KUDU KNIT PROCESS PVT LTD",
      "LAKRA INTERNATIONAL",
      "LAKSHITA PRINT",
      "LEEN INTERNETIONAL FABRICS (P) LTD",
      "LINE LOGIC TECHNOLOGIES",
      "LOGU PACKS",
      "M B TEXTILES",
      "M LACHHMANDAS & CO",
      "M LACHMANDAS",
      "M M CONTAINERS PVT LTD",
      "M P HOSIERY MILLS-TIRUPUR",
      "M S LABELS",
      "MAAVISA FOM CUP PVT LTD",
      "MADURA COATS PRIVATE LIMITED-KARNATAKA",
      "MADURA COATS PRIVATE LIMITED-TAMIL NADU",
      "MAM PACKAGERS",
      "MAM TRADERS",
      "MANALI CARTON INDUSTRIES",
      "MANO CREATORS",
      "MARUTI TEXPROCESS INDIA PRIVATE LIMITED",
      "MAURYA EXPORTS",
      "MAURYA PACKAGING",
      "MERCURY KNITS",
      "MINAL ENTERPRISE",
      "MIRAJ MULTICOLOUR PRIVATE LIMITED",
      "MOM PACK",
      "MOM PACKERS",
      "NAALVAR TEXTILES",
      "NAS PACK",
      "NATIONAL CORPORATION",
      "NAVIN PLASTIC TECH",
      "NETFLEX INDIA PRIVATE LIMITED",
      "NICKY ENTERPRISES",
      "NILESH IMPEX INDIA PRIVATE LIMITED",
      "OM KRAFT - BANGLORE",
      "OMAX COTSPIN PVT LTD",
      "P M G TEXTILES",
      "PARUTHI KNITS PRIVATE LIMITED",
      "PEE ESS ENTERPRISES",
      "PLY MASTER",
      "POLY ELASTIC",
      "POLYELASTIC P LTD",
      "POPULAR FABRICS",
      "PRABHANJANA PACK",
      "PRAKASH ARTS",
      "PREM INDUSTRIES",
      "PREMIER SPG AND WVG MILLS PVT LTD",
      "PROGRESSIVE TRENDZ PVT LTD",
      "PUSSY CAT GARMENTS INDUSTRIES",
      "R K ENTERPRISES",
      "R R IMPEX",
      "RADHA LACES",
      "RAJESH INTERNATIONAL",
      "RANK ENTERPRISES",
      "REFRATEX INDIA",
      "REXINE HOUSE",
      "RICCIES",
      "RICCIES INDUSTRIES",
      "ROYAL KNIT FAB",
      "ROYAL PACKAGING",
      "S & S GARMENT ACCESSORIES INDIA PRIVATE LIMITED",
      "S A GRAPHICS",
      "S.L.PLASTIC",
      "S.S. POLY PACKS",
      "SACHINAM",
      "SACHINAM FABRICS PVT LTD",
      "SAFEPAC INDUSTRIES",
      "SAI THIVYA MARKETING-TIRUPUR",
      "SANKAR TEXTILES PRIVATE LIMITED",
      "SANYA FABRICS",
      "SARATHA TEXTILES - NAMAKKAL",
      "SASTI STICKER",
      "SAUMYA CREATION",
      "SAVVY INDUSTRIES",
      "SBHM APPARELS",
      "SHAKTHI KNITTING PRIVATE LIMITED",
      "SHEELA FOAM",
      "SHEELA FOAM LIMITED - ERODE",
      "SHREE HINGLAJ PRODUCT",
      "SHREENATH POLY PLAST",
      "SHRI VIGNESH SALES CORPORATION",
      "SIDDHARTH TEXTILES",
      "SIDDHI KNITFAB PRIVATE LIMITED",
      "SIVAM TRADERS",
      "SKY INDUSTRIES LTD",
      "SPT ENTERPRISES - TIRUPUR",
      "SREE GANESH LINGA ENTERPRISE",
      "SREE SAKTHI KNIT PACKS",
      "SREE SREENIVASA TEXTILE MILLS",
      "SRI KRISHNA FABRICS",
      "SRI MAHALAXMI ENTERPRISES",
      "SRI RENUGA CREATION",
      "SRI SAIRAM PRINTS",
      "SRI VENKATESWARA ENTERPRISES",
      "STERLING PRINT HOUSE PRIVATE LIMITED",
      "STITCHLINE INTERNATIONAL",
      "STRAPTEX",
      "STRAPTEX (I) P LTD",
      "STRETCH FAB - GHAZIABAD",
      "SUKEE PRINT PACK LLP",
      "SUPPLIER A",
      "SUPPLIER B",
      "SUVI EXPORTS LLP",
      "SWATHI EXPORTS",
      "SYNPACK FLEXPACK PVT LTD",
      "T R PACKING PRODUCTS",
      "TANVI CREATIONS",
      "TARUNYHA INDUSTRIES",
      "TEXIN INDIA",
      "TEXKNIT",
      "TEXTILE EXPORT CORPORATION",
      "TEXWORLD TEXTILE",
      "THE FABRIC PEOPLE",
      "THE MATRIX ENTERPRICES",
      "THREE KAY EMPORIUM",
      "TIRUCHENDUR CARTON INDUSTRIES",
      "TRYLO INDUSTRIES",
      "Twenty First Century Creations Private Limited",
      "ULTRON TEXTILES LLP",
      "UNIK TECHNOLOGYZ",
      "V K N FABRICS - TIRUPUR",
      "V P TEX PRIVATE LIMITED",
      "V S & CO",
      "V2 POLY INDUSTRIES",
      "VARDHAMAN TEXTILES",
      "VARDHAMAN YARNS",
      "VARDHMAN PACKAGING - BANGALORE",
      "VARDHMAN TEXTILES LIMITED",
      "VGS CLOTHING",
      "VIMA TAPES",
      "VIN SPORTS",
      "VISHAL TRADING CO",
      "Vardhaman Yarns and Threads Limited",
      "WELCO AGENCIES PRIVATE LIMITED",
      "WELSO LIFE PRIVATE LIMITED",
      "WHITE SQUARE"
    ],
    "ITEMS": [
      "STICKER CARICATURE HOMEWEAR",
      "STICKER DONOT IRON HOME WEAR",
      "STICKER FEEDING BRA",
      "STICKER FULL COVERAGE PANTY",
      "STICKER HOLOGRAM",
      "STICKER LARGE BLOSSOM PLAIN",
      "STICKER LARGE BLOSSOM PRINTED",
      "STICKER MEDIUM BLOSSOM PRINTED 70*40",
      "STICKER PANTY SIZE PLAIN",
      "STICKER SMALL BLOSSOM PRINTED 60*35 MM",
      "BOX TOP AND BOTTOM Large with Top Laminated& Bottom with 340 Gsm Natural Shade Craft Paper",
      "LABEL HT BIRD LOGO (GEL)- SMALL WHITE",
      "LABEL HT BLOSSOM 100CM-COTTON RICH WHITE",
      "LABEL HT BLOSSOM 75CM-COTTON RICH WHITE",
      "LABEL HT BLOSSOM 80CM-COTTON RICH WHITE",
      "LABEL HT BLOSSOM 85CM-COTTON RICH WHITE",
      "PACKING BOX",
      "POLYBAG",
      "CARTON",
      "FABRIC",
      "ELASTIC",
      "HOOK & EYE",
      "THREAD",
      "ZIPPER",
      "LABEL",
      "CUPS",
      "RING & SLIDER",
      "TRIMS",
      "ACCESSORIES",
      "CLOTH\xA0KTD\xA0SJ\xA095% Lenzing MDL Siro Compact 40s 5% SPX\xA020D \xA0170GSM\xA070INCH OPEN WIDTH - MPP 30",
      "LABEL HT BLOSSOM 90CM-COTTON RICH WHITE",
      "LABEL HT BLOSSOM 95CM-COTTON RICH WHITE",
      "ELASTIC KTD 75%PLSTR 25%RUBBER 25MM WHITE",
      "CLOTH\xA0KTD\xA0SJ\xA095% Lenzing MDL Siro Compact 40s 5% SPX\xA020D \xA0170GSM\xA070INCH OPEN WIDTH - MPP 26",
      "CLOTH\xA0KTD\xA0SJ\xA095% Lenzing MDL Siro Compact 40s 5% SPX\xA020D \xA0170GSM\xA070INCH OPEN WIDTH - MPP 28",
      "CLOTH\xA0KTD\xA0SJ\xA095% Lenzing MDL Siro Compact 40s 5% SPX\xA020D \xA0170GSM\xA070INCH OPEN WIDTH - MPP 27",
      "CLOTH\xA0KTD\xA0SJ\xA095% Lenzing MDL Siro Compact 40s 5% SPX\xA020D \xA0170GSM\xA070INCH OPEN WIDTH - MPP 29",
      "ACC DRAW CORD 100%CTN 10MM ROPE",
      "CLOTH KTD SJ BAMBOO 45% COTTON 55% 34S 135GSM 36INCH TUBULAR MOLLARD BLUE",
      "CLOTH KTD SJ BAMBOO 45% COTTON 55% 34S 135GSM 36INCH TUBULAR ROSE GOLD",
      "HOOK-EYE 4x3 MICRO FIBER NYLON-SS 55-60MM NON BRUSHED-RELUX RFD",
      "ELASTIC MICRO NARROW WOVEN BUFF 84%NYLON 16%SPNDX 18MM\xA0MAROON",
      "THREAD TRILOBAL PLSTR 27TX 2000MTRS CANAL BLUE",
      "THREAD TRILOBAL PLSTR 27TX 2000MTRS ORCHID BLOOM",
      "CUP PADDED PLMD 32 VLGL-10 NAVY BLUE",
      "CUP PADDED PLMD 34 VLGL-10 NAVY BLUE",
      "CUP PADDED PLMD 36 VLGL-10 NAVY BLUE",
      "CUP PADDED PLMD 38 VLGL-10 NAVY BLUE",
      "CUP PADDED PLMD 40 VLGL-10 NAVY BLUE",
      "CLOTH\xA0KTD\xA0SJ\xA048%CTN\xA044%PLSTR\xA08%SPNDX\xA040s\xA0230GSM BIO SILICON SOFT I.GREEN",
      "CLOTH\xA0KTD\xA0SJ\xA048%CTN\xA044%PLSTR\xA08%SPNDX\xA040s\xA0230GSM BIO SILICON SOFT NAVY BLUE",
      "CLOTH\xA0KTD\xA0SJ\xA048%CTN\xA044%PLSTR\xA08%SPNDX\xA040s\xA0230GSM BIO SILICON SOFT SILVER GREY",
      "TAPE PLSTR JULIE LACE 10MM SLATE",
      "TAPE PLSTR JULIE LACE 10MM SEPLA ROSE",
      "TAPE PLSTR JULIE LACE 10MM CORONET BLUE",
      "ADJUSTER METAL COATED 12MM PIGEON GREY",
      "ADJUSTER METAL COATED 12MM DARK GREY",
      "BOW SATIN NYLON 6MM AUTUMN COPPER",
      "BOW SATIN NYLON 6MM GREY",
      "ELASTIC MICRO NARROW WOVEN BUFF 84%NYLON 16%SPNDX 10MM\xA0 ICEBERG GREEN",
      "THREAD 3PLY PLSTR 24TX 5000MTRS ICEBERG GREEN",
      "THREAD GRAMAX PLSTR 18TX 5000MTRS ICEBERG GREEN",
      "ADJUSTER METAL COATED 10MM ICEBERG GREEN",
      "ADJUSTER METAL COATED 10MM NAVY BLUE",
      "HOOK-EYE 2x3 MICRO FIBER NYLON-SS 32-60MM NON BRUSHED-RELUX NAVY BLUE",
      "HOOK-EYE 3x3 MICRO FIBER NYLON-SS 44-55MM NON BRUSHED-RELUX NAVY BLUE",
      "HOOK-EYE 3x3 MICRO FIBER NYLON-SS 45-60MM NON BRUSHED-RELUX ICEBERG GREEN",
      "ACC REVERSABLE 44INCH RUBBER SUBBER WHITE",
      "BOW SATIN NYLON 6MM ICEBERG GREEN",
      "BOW SATIN NYLON 6MM NAVY BLUE",
      "TAPE NARROW WOVEN BINDING 100%NYLON 18MM SN201-18 NAVY BLUE",
      "THREAD 3PLY PLSTR 24TX 5000MTRS NAVY BLUE",
      "THREAD 3PLY PLSTR 24TX 5000MTRS PICKLE BEET",
      "THREAD GRAMAX PLSTR 18TX 5000MTRS NAVY BLUE",
      "CLOTH KTD SJ BAMBOO 45% COTTON 55% 34S 135GSM 36INCH TUBULAR ENGLISH LAVENDER",
      "CLOTH KTD SJ BAMBOO 45% COTTON 55% 34S 135GSM 36INCH TUBULAR MAROON",
      "CLOTH KTD SJ BAMBOO 45% COTTON 55% 34S 135GSM 36INCH TUBULAR DUSK BLUE",
      "MASTER CARTON 18 BOX 5 PLY (74.5*32*57.5)cm(L*W*H)",
      "ELASTIC KTD CROCHET 75%PLSTR 25%RUBBER 100MM BLACK",
      "ELASTIC KTD CROCHET 75%PLSTR 25%RUBBER 80MM BLACK",
      "CLOTH\xA0KTD\xA0SJ\xA095% Lenzing MDL Siro Compact 40s 5% SPX\xA020D \xA0170GSM\xA070INCH OPEN WIDTH - DEEP WISTERIA",
      "CLOTH\xA0KTD\xA0SJ\xA095% Lenzing MDL Siro Compact 40s 5% SPX\xA020D \xA0170GSM\xA070INCH OPEN WIDTH - MEADOW",
      "ELASTIC KTD 80%PLSTR 20%SPNDX 20MM WHITE",
      "CLOTH\xA0KTD\xA0SJ\xA095% Lenzing MDL Siro Compact 40s 5% SPX\xA020D \xA0170GSM\xA070INCH OPEN WIDTH - MULBERRY",
      "THREAD 3PLY PLSTR 24TX 5000MTRS CANAL BLUE",
      "THREAD 3PLY PLSTR 24TX 5000MTRS ORCHID BLOOM",
      "ELASTIC KTD CROCHET 85%PLSTR 15%SPANDEX PRISHRINK 10MM WHITE (Band)",
      "ELASTIC KTD CROCHET 85%PLSTR 15%SPANDEX PRISHRINK 12MM WHITE (Band)",
      "ELASTIC NARROW WOVEN 70%NYLON 30%SPNDX 06MM SN15-06 WHITE",
      "TAPE NARROW WOVEN BINDING 100%NYLON 18MM SN201-18 I.GREEN",
      "CLOTH KTD SJ 52% CTN 48% PLSTR 30s 180GSM 43INCH TUBULAR WIDTH BIO & SILICON FINISH ICE BERG GREEN",
      "CLOTH KTD SJ 52% CTN 48% PLSTR 30s 180GSM 43INCH TUBULAR WIDTH BIO & SILICON FINISH NAVY BLUE",
      "CLOTH KTD SJ 52% CTN 48% PLSTR 30s 180GSM 43INCH TUBULAR WIDTH BIO & SILICON FINISH PIGEON",
      "CLOTH KTD SJ 52% CTN 48% PLSTR 30s 180GSM 43INCH TUBULAR WIDTH BIO & SILICON FINISH ROSY BROWN",
      "CLOTH KTD SJ 52% CTN 48% PLSTR 30s 180GSM 43INCH TUBULAR WIDTH BIO & SILICON FINISH SILVER",
      "CLOTH KTD SJ 52% CTN 48% PLSTR 30s 180GSM 43INCH TUBULAR WIDTH BIO & SILICON FINISH DARK GREY",
      "CLOTH KTD SJ 52% CTN 48% PLSTR 30s 180GSM 43INCH TUBULAR WIDTH BIO & SILICON FINISH PURPLE",
      "HOOK-EYE 2x3 MICRO FIBER NYLON-SS 32-60MM NON BRUSHED-RELUX ICEBERG GREEN",
      "BOW SATIN NYLON 6MM STEEL GREY",
      "BOW SATIN NYLON 6MM PICKLE BEET",
      "ELASTIC NARROW WOVEN FOLDING 77%NYLON 23%SPNDX 15MM SN312-15 PIGEON GREY",
      "THREAD GRAMAX PLSTR 18TX 5000MTRS PIGEON GREY",
      "ELASTIC NARROW WOVEN FOLDING 77%NYLON 23%SPNDX 20MM\xA0 SN312-20 MAROON",
      "ELASTIC NARROW WOVEN FOLDING 77%NYLON 23%SPNDX 20MM CHARCOAL",
      "ELASTIC NARROW WOVEN FOLDING 77%NYLON 23%SPNDX 20MM COFFEE",
      "ELASTIC NARROW WOVEN FOLDING 77%NYLON 23%SPNDX15MM SN312-15 MAROON",
      "ELASTIC NARROW WOVEN FOLDING 77%NYLON 23%SPNDX 16MM ROSE GOLD",
      "ELASTIC NARROW WOVEN FOLDING 77%NYLON 23%SPNDX 20MM DARK BLUE",
      "CLOTH KTD SJ BAMBOO 45% COTTON 55% 34S 135GSM 36INCH TUBULAR\xA0\xA0 EBBAND FLOW",
      "CLOTH KTD SJ 95%CTN 5%SPNDX 40s 180GSM \xA062INCH OPEN WIDTH RIVERSIDE",
      "CLOTH KTD SJ BAMBOO 45% COTTON 55% 34S 135GSM 36INCH TUBULAR\xA0COCA MOCHA",
      "TAPE NARROW WOVEN BINDING 100%NYLON 18MM SN201-18 PIGEON GREY",
      "ADJUSTER METAL COATED 10MM STEEL GREY",
      "HOOK-EYE 2x3 MICRO FIBER NYLON-SS 32-60MM NON BRUSHED-RELUX STEEL GREY",
      "HOOK-EYE 3x3 MICRO FIBER NYLON-SS 44-55MM NON BRUSHED-RELUX STEEL GREY",
      "ELASTIC MICRO NARROW WOVEN BUFF 84%NYLON 16%SPNDX 10MM STEEL GREY",
      "TAPE NARROW WOVEN BINDING 100%NYLON 18MM SN201-18 STEEL GREY",
      "THREAD 3PLY PLSTR 24TX 5000MTRS STEEL GREY",
      "THREAD GRAMAX PLSTR 18TX 5000MTRS STEEL GREY",
      "ELASTIC MICRO NARROW WOVEN BUFF 84%NYLON 16%SPNDX 10MM\xA0 PICKLE BEET",
      "TAPE NARROW WOVEN BINDING 100%NYLON 18MM SN201-18 PICKLE BEET",
      "THREAD GRAMAX PLSTR 18TX 5000MTRS PICKLE BEET",
      "ADJUSTER METAL COATED 10MM PICKLE BEET",
      "HOOK-EYE 2x3 MICROFIBER NYLON-SS 32-60MM NON BRUSHED-RELUX PICKLE BEET",
      "HOOK-EYE 3x3 MICRO FIBER NYLON-SS 44-55MM NON BRUSHED-RELUX PICKLE BEET",
      "HOOK-EYE 2x3 MICRO FIBRE NYLON-SS 32-60MM NON BRUSHED-RELUX PIGEON GREY",
      "HOOK-EYE 3x3 MICRO FIBRE NYLON-SS 44-55MM NON BRUSHED-RELUX PIGEON GREY",
      "BOW SATIN NYLON 6MM PIGEON GREY",
      "ELASTIC MICRO NARROW WOVEN BUFF 84%NYLON 16%SPNDX 12MM\xA0 PIGEON GREY",
      "ELASTIC MICRO NARROW WOVEN BUFF 84%NYLON 16%SPNDX 14MM PIGEON GREY",
      "THREAD 3PLY PLSTR 24TX 5000MTRS PIGEON GREY",
      "ELASTIC NARROW WOVEN 77%NYLON 23%SPNDX 17MM SPL18 BL LPP 103",
      "BOW SATIN NYLON 3MM COLOUR",
      "ELASTIC NARROW WOVEN 77%NYLON 23%SPNDX 17MM SPL18 BL LPP 102",
      "ELASTIC NARROW WOVEN 87 % MICRO NYLON 13%SPNDX\xA0 20MM GREY / RED STRIPES",
      "ELASTIC NARROW WOVEN 87 % MICRO NYLON 13%SPNDX\xA0 20MM NAVY/ GREY STRIPES",
      "HOOK-EYE 2x3 MICRO FIBER NYLON-SS 32-60MM NON BRUSHED-RELUX MAROON",
      "HOOK-EYE 3x3 MICRO FIBER NYLON-SS 45-60MM NON BRUSHED-RELUX MAROON",
      "CLOTH KTD 8LOCK 50%CTN 50%PLSTR 40s 240GSM BIO FINISH PIGEON GREY",
      "CLOTH KTD SJ 52% CTN 48% PLSTR 30s 180GSM 43INCH TUBULAR WIDTH BIO & SILICON FINISH PICKLE BEET",
      "CLOTH KTD SJ 52% CTN 48% PLSTR 30s 180GSM 43INCH TUBULAR WIDTH BIO & SILICON FINISH STEEL GREY",
      "HOOK-EYE 2x3 MICRO FIBER NYLON-SS 32-60MM NON BRUSHED-RELUX BURL WOOD",
      "HOOK-EYE 2x3 MICRO FIBER NYLON-SS 32-60MM NON BRUSHED-RELUX MEDIEVAL BLUE",
      "THREAD TRILOBAL PLSTR 27TX 2000MTRS DEEP TAUPE",
      "BOW SATIN NYLON 6MM WHITE",
      "ELASTIC MICRO NARROW WOVEN BUFF 84%NYLON 16%SPNDX 10MM\xA0 WHITE",
      "TAPE NARROW WOVEN BINDING 100%NYLON 18MM SN201-18 MEDIEVAL BLUE",
      "ELASTIC NARROW WOVEN BUFF 90%NYLON 10%SPNDX 10MM SN18-10 BURL WOOD",
      "ELASTIC NARROW WOVEN BUFF 90%NYLON 10%SPNDX 10MM SN18-10 CARBON",
      "ELASTIC NARROW WOVEN BUFF 90%NYLON 10%SPNDX 10MM SN18-10 CORONET BLUE",
      "ELASTIC NARROW WOVEN BUFF 90%NYLON 10%SPNDX 10MM SN18-10 DEEP TAUPE",
      "ELASTIC NARROW WOVEN BUFF 90%NYLON 10%SPNDX 10MM SN18-10 MAROON",
      "ELASTIC NARROW WOVEN BUFF 90%NYLON 10%SPNDX 10MM SN18-10 MAUVE",
      "ELASTIC NARROW WOVEN BUFF 90%NYLON 10%SPNDX 10MM SN18-10 QUIAL",
      "ELASTIC NARROW WOVEN BUFF 90%NYLON 10%SPNDX 10MM SN18-10 SEPLA ROSE",
      "ELASTIC NARROW WOVEN BUFF 90%NYLON 10%SPNDX 10MM SN18-10 SLATE",
      "ELASTIC MICRO NARROW WOVEN BUFF 84%NYLON 16%SPNDX 12MM\xA0CORONET BLUE",
      "ELASTIC MICRO NARROW WOVEN BUFF 84%NYLON 16%SPNDX 12MM\xA0SLATE",
      "ELASTIC MICRO NARROW WOVEN BUFF 84%NYLON 16%SPNDX 12MM\xA0SEPLA ROSE",
      "ELASTIC MICRO NARROW WOVEN BUFF 84%NYLON 16%SPNDX 14MM\xA0CORONET BLUE",
      "ELASTIC MICRO NARROW WOVEN BUFF 84%NYLON 16%SPNDX 14MM\xA0SEPLA ROSE",
      "ELASTIC MICRO NARROW WOVEN BUFF 84%NYLON 16%SPNDX 14MM\xA0SLATE",
      "ELASTIC NARROW WOVEN ARROW 84%NYLON 16%SPANDEX 18MM BLACK",
      "ELASTIC MICRO NARROW WOVEN BUFF 84%NYLON 16%SPNDX 18MM\xA0MEDIEVAL BLUE",
      "ELASTIC MICRO NARROW WOVEN BUFF 84%NYLON 16%SPNDX 14MM MAROON",
      "ELASTIC MICRO NARROW WOVEN BUFF 84%NYLON 16%SPNDX 14MM\xA0 DEEP TAPUE",
      "ELASTIC MICRO NARROW WOVEN BUFF 84%NYLON 16%SPNDX 14MM\xA0 QUIAL",
      "HOOK-EYE 2x3 MICRO FIBER NYLON-SS 32-60MM NON BRUSHED-RELUX WHITE",
      "HOOK-EYE 2x3 MICRO FIBER NYLON-SS 32-60MM NON BRUSHED-RELUX DEEP TAUPE",
      "HOOK-EYE 2x3 MICRO FIBER NYLON-SS 32-60MM NON BRUSHED-RELUX QUIAL",
      "HOOK-EYE 2x3 MICRO FIBER NYLON-SS 32-60MM NON BRUSHED-RELUX CORONET BLUE",
      "HOOK-EYE 2x3 MICRO FIBER NYLON-SS 32-60MM NON BRUSHED-RELUX SLATE",
      "HOOK-EYE 2x3 MICRO FIBER NYLON-SS 32-60MM NON BRUSHED-RELUX SEPLA ROSE",
      "HOOK-EYE 2x3 MICRO FIBER NYLON-SS 32-60MM NON BRUSHED-RELUX BLACK",
      "ELASTIC MICRO NARROW WOVEN BUFF 84%NYLON 16%SPNDX 14MM\xA0 MEDIVIEVAL BLUE",
      "ELASTIC MICRO NARROW WOVEN BUFF 84%NYLON 16%SPNDX 18MM\xA0SEPLA ROSE",
      "CLOTH WOVEN 132 EPI-72PPI 100%CTN 40S 125GSM 58INCH WHITE",
      "CLOTH WOVEN 132 EPI-72PPI 100%CTN 40S 125GSM 58INCH SLATE",
      "CLOTH WOVEN 132 EPI-72PPI 100%CTN 40S 125GSM 58INCH\xA0BURL WOOD",
      "CLOTH WOVEN 132 EPI-72PPI 100%CTN 40S 125GSM 58INCH SEPLA ROSE",
      "CLOTH WOVEN 132 EPI-72PPI 100%CTN 40S 125GSM 58INCH QUAIL",
      "CLOTH WOVEN 132 EPI-72PPI 100%CTN 40S 125GSM 58INCH DEEP TAUPE",
      "CLOTH WOVEN 132 EPI-72PPI 100%CTN 40S 125GSM 58INCH CORONET BLUE",
      "CLOTH WOVEN 132 EPI-72PPI 100%CTN 40S 125GSM 58INCH BLACK",
      "CLOTH WOVEN HACOBA MN 4185  100%CTN 40S 132 NUDE",
      "CLOTH WOVEN HACOBA MN 4185  100%CTN 40S 132SEPLA ROSE",
      "CLOTH WOVEN HACOBA MN 4185  100%CTN 40S 132BURLWOOD",
      "THREAD CTN 20s 1000 WHITE",
      "HOOK-EYE 3x3 MICRO FIBER NYLON-SS 45-60MM NON BRUSHED-RELUX RFD",
      "HOOK-EYE 2x3 MICRO FIBER NYLON-SS 32-60MM NON BRUSHED-RELUX NUDE",
      "ELASTIC NARROW WOVEN BUFF 84%NYLON 16%SPNDX 12MM SN51-12 AUTUMN COPPER",
      "ELASTIC NARROW WOVEN BUFF 84%NYLON 16%SPNDX 14MM SN51-14 AUTUMN COPPER",
      "ELASTIC NARROW WOVEN FOLDING 77%NYLON 23%SPNDX 15MM SN312-15\xA0AUTUMN COPPER",
      "TAPE NARROW WOVEN BINDING 100%NYLON 18MM SN201-18 AUTUMN COPPER",
      "THREAD 3PLY PLSTR 24TX 5000MTRS AUTUMN COPPER",
      "THREAD GRAMAX PLSTR 18TX 5000MTRS\xA0AUTUMN COPPER",
      "ELASTIC NARROW WOVEN FOLDING 77%NYLON 23%SPNDX 15MM SN312-15 DARK GREY",
      "ADJUSTER METAL COATED 12MM AUTUMN COPPER",
      "HOOK-EYE 4X3 MICRO FIBER NYLON-55-60MM NON BRUSHED-RELUX NUDE",
      "BOW SATIN NYLON 6MM DARK GREY",
      "ELASTIC NARROW WOVEN BUFF 84%NYLON 16%SPNDX 14MM SN51-12\xA0DARK GERY",
      "ELASTIC NARROW WOVEN BUFF 84%NYLON 16%SPNDX 14MM SN51-14\xA0DARK GERY",
      "HOOK-EYE 2x3 MICRO FIBER NYLON-SS 32-60MM NON BRUSHED-RELUX DARK GREY",
      "TAPE NARROW WOVEN BINDING 100%NYLON\xA0 18MM SN201-18 DARK GREY",
      "THREAD 3PLY PLSTR 24TX 5000MTRS DARK GREY",
      "THREAD GRAMAX PLSTR 18TX 5000MTRS DARK GREY",
      "HOOK-EYE 3x3 MICRO FIBER NYLON-SS 45-60MM NON BRUSHED-RELUX DARK GREY",
      "ELASTIC NARROW WOVEN 84%NYLON 16% SPANDEX 32MM CORONET BLUE",
      "ELASTIC NARROW WOVEN 84%NYLON 16% SPANDEX 32MM SLATE",
      "ELASTIC NARROW WOVEN 84%NYLON 16% SPANDEX 25MM MEDIEVAL BLUE",
      "ELASTIC NARROW WOVEN 84%NYLON 16%SPANDEX 25MM SEPLA ROSE",
      "ELASTIC NARROW WOVEN FOLDING 77%NYLON 23%SPNDX 16MM WHITE",
      "ELASTIC MICRO NARROW WOVEN BUFF 84%NYLON 16%SPNDX 14MM\xA0 WHITE",
      "THREAD TRILOBAL PLSTR 27TX 2000MTRS QUIAL",
      "THREAD TRILOBAL PLSTR 27TX 2000MTRS SLATE",
      "THREAD TRILOBAL PLSTR 27TX 2000MTRS NUDE",
      "THREAD TRILOBAL PLSTR 27TX 2000MTRS WHITE",
      "ELASTIC MICRO NARROW WOVEN BUFF 84%NYLON 16%SPNDX 14MM\xA0NUDE",
      "THREAD 3PLY PLSTR 24TX 5000MTRS WHITE",
      "HOOK-EYE 4x3 MICRO FIBER NYLON-SS 55-57MM NON BRUSHED-RELUX WHITE",
      "THREAD CTN 20S 1000 BURL WOOD",
      "THREAD CTN 20S 1000 DEEP TAUPE",
      "THREAD CTN 20S 1000 MAROON",
      "THREAD CTN 20S 1000 MEDIEVAL BLUE",
      "THREAD CTN 20S 1000 SLATE",
      "THREAD CTN 20S 1000 SEPLA ROSE",
      "THREAD CTN 20S 1000 NUDE",
      "ELASTIC MICRO NARROW WOVEN BUFF 84%NYLON 16%SPNDX 14MM MAUVE",
      "ELASTIC NARROW WOVEN 84%NYLON 16%SPANDEX 32MM BURL WOOD",
      "ELASTIC NARROW WOVEN 84%NYLON 16%SPANDEX 32MM DEEP TAUPE",
      "ELASTIC NARROW WOVEN 84%NYLON 16%SPANDEX 32MM QUIAL",
      "ELASTIC NARROW WOVEN 84%NYLON 16%SPANDEX 25MM SLATE",
      "ELASTIC NARROW WOVEN ARROW 84%NYLON 16%SPANDEX 25MM NUDE",
      "CLOTH KTD INTRL 52% CTN 48% PLSTR 40s 220GSM 36INCH TUBULAR WIDTH BIO FINISH GREY",
      "CLOTH KTD INTRL 52% CTN 48%\xA0PLSTR\xA040s 220GSM BIO FINISH 36INCH TUBULAR WIDTH ASH ROSE",
      "CLOTH KTD INTRL 52% CTN 48%\xA0PLSTR\xA040s 220GSM BIO FINISH 36INCH TUBULAR WIDTH DARK GREY",
      "CLOTH KTD INTRL 52% CTN 48%\xA0PLSTR\xA040s 220GSM BIO FINISH 36INCH TUBULAR WIDTH HEDGE GREEN",
      "ELASTIC MICRO NARROW WOVEN BUFF 84%NYLON 16%SPNDX 12MM\xA0 BURL WOOD",
      "ELASTIC MICRO NARROW WOVEN BUFF 84%NYLON 16%SPNDX 14MM BURL WOOD",
      "ELASTIC MICRO NARROW WOVEN BUFF 84%NYLON 16%SPNDX 18MM NUDE",
      "HOOK-EYE 3x3 MICRO FIBER NYLON-SS 45-60MM NON BRUSHED-RELUX BURL WOOD",
      "ELASTIC MICRO NARROW WOVEN BUFF 84%NYLON 16%SPNDX 12MM\xA0 DEEP TAUPE",
      "ELASTIC NARROW WOVEN ARROW 84%NYLON 16%SPANDEX 25MM WHITE",
      "CLOTH WOVEN 132 EPI-72PPI 100%CTN 40S 125GSM 58INCH NUDE",
      "CLOTH WOVEN 132 EPI-72PPI 100%CTN 40S 125GSM 58INCH MAROON",
      "THREAD TRILOBAL PLSTR 27TX 2000MTRS\xA0 MAROON",
      "THREAD TRILOBAL PLSTR 27TX 2000MTRS SEPLA ROSE",
      "ADJUSTER METAL COATED 12MM NUDE",
      "ADJUSTER METAL COATED 12MM MAROON",
      "ADJUSTER METAL COATED 18MM NUDE",
      "ADJUSTER METAL COATED 18MM WHITE",
      "BOW SATIN NYLON 6MM NUDE",
      "CLOTH WOVEN 132 EPI-72PPI 100%CTN 40S 125GSM 58INCH MEDIEVAL BLUE",
      "CLOTH WOVEN VAKRUM 1 100%CTN 25MM WHITE",
      "TAPE PLSTR JULIE LACE 10MM WHITE",
      "TAPE PLSTR JULIE LACE 10MM NUDE",
      "ACC STRAP 100% CTN 14MM NUDE",
      "THREAD 3PLY PLSTR 24TX 5000MTRS MAROON",
      "THREAD 3PLY PLSTR 24TX 5000MTRS MEDIEVAL BLUE",
      "THREAD 3PLY PLSTR 24TX 5000MTRS BURL WOOD",
      "THREAD 3PLY PLSTR 24TX 5000MTRS DEEP TAUPE",
      "THREAD 3PLY PLSTR 24TX 5000MTRS QUIAL",
      "THREAD 3PLY PLSTR 24TX 5000MTRS SEPLA ROSE",
      "THREAD 3PLY PLSTR 24TX 5000MTRS SLATE",
      "THREAD 3PLY PLSTR 24TX 5000MTRS NUDE",
      "ACC STRAP 100% CTN 14MM WHITE",
      "HOOK-EYE 3*3 MICRO FIBER NYLON-SS 44-55MM NON BRUSHED-RELUX MAROON",
      "ELASTIC NARROW WOVEN 77%NYLON 23%SPNDX 17MM SN86-17 NUDE",
      "ELASTIC MICRO NARROW WOVEN BUFF 84%NYLON 16%SPNDX 18MM\xA0CORONET BLUE",
      "ELASTIC MICRO NARROW WOVEN BUFF 84%NYLON 16%SPNDX 18MM\xA0SLATE",
      "ELASTIC NARROW WOVEN 84%NYLON 16%SPANDEX 25MM MAROON",
      "THREAD CTN 20S 1000 QUIAL",
      "THREAD CTN 20S 1000 CORONET BLUE",
      "HOOK-EYE 2x3 MICRO FIBER NYLON-SS 32-60MM NON BRUSHED-RELUX RFD",
      "HOOK-EYE 3x3 MICRO FIBER NYLON-SS 45-60MM NON BRUSHED-RELUX SEPLA ROSE",
      "HOOK-EYE 3x3 MICRO FIBER NYLON-SS 45-60MM NON BRUSHED-RELUX SLATE",
      "HOOK-EYE 3x3 MICRO FIBER NYLON-SS 45-60MM NON BRUSHED-RELUX CORONET BLUE",
      "ELASTIC NARROW WOVEN ARROW 84%NYLON 16%SPANDEX 18MM NUDE",
      "ELASTIC NARROW WOVEN ARROW 84%NYLON 16%SPANDEX 14MM NUDE",
      "ACC PU-FOAM 32 DENSITY\xA0 6 MM WHITE",
      "ELASTIC MICRO NARROW WOVEN BUFF 84%NYLON 16%SPNDX 25MM MAROON",
      "ELASTIC MICRO NARROW WOVEN BUFF 84%NYLON 16%SPNDX 12MM\xA0 WHITE",
      "ELASTIC MICRO NARROW WOVEN BUFF 84%NYLON 16%SPNDX 18MM DEEP TAUPE",
      "ELASTIC MICRO NARROW WOVEN BUFF 84%NYLON 16%SPNDX 18MM\xA0 WHITE",
      "ELASTIC NARROW WOVEN 84%NYLON 16%RUBBER 32MM NUDE",
      "ELASTIC NARROW WOVEN 84%NYLON 16%RUBBER 25MM NUDE",
      "ELASTIC MICRO NARROW WOVEN BUFF 84%NYLON 16%SPNDX 14MM BLACK",
      "ELASTIC NARROW WOVEN 84%NYLON 16% SPANDEX 32MM MAROON",
      "CLOTH KTD SJ 100%CTN 34s 135GSM 36INCH TUBULAR WHITE",
      "CLOTH KTD SJ 100%CTN 36s 130GSM 36INCH TUBULAR CARBON",
      "CLOTH KTD SJ 100%CTN 34S 135GSM 36INCH TUBULAR CORONET BLUE",
      "CLOTH KTD SJ 100%CTN 34s 135GSM 36INCH TUBULAR NUDE",
      "CLOTH KTD SJ 100%CTN 34S 135GSM 36INCH TUBULAR SEPLA ROSE",
      "CLOTH KTD SJ 100%CTN 34S 135GSM 36INCH TUBULAR SLATE",
      "CLOTH WOVEN HACOBA MN 4185  100%CTN 40S 132 MAROON",
      "CLOTH WOVEN HACOBA MN 4185  100%CTN 40S 132 CORONET BLUE",
      "ELASTIC NARROW WOVEN 84%NYLON 16%SPANDEX 25MM BURL WOOD",
      "ELASTIC NARROW WOVEN 84%NYLON 16%SPANDEX 25MM CORONET BLUE",
      "ELASTIC NARROW WOVEN 84%NYLON 16%SPANDEX 25MM DEEP TAUPE",
      "HOOK-EYE 2*3 MICRO FIBRE NYLON-SS 32-60MM NON BRUSHED-RELUX MAROON",
      "CLOTH WOVEN 140324 136 EPI-72 PPI\xA0 96% Cotton 4% Spandex 40*40 Spandex 135 GSM 48 INCH Width\xA0NUDE",
      "CLOTH WOVEN 140324 136 EPI-72 PPI\xA0 96% Cotton 4% 40*40 Spandex 135 GSM 48 INCH Width\xA0CORONET BLUE",
      "CLOTH WOVEN 140324 136 EPI-72 PPI\xA0 96% Cotton 4% 40*40 Spandex 135 GSM 48 INCH Width\xA0SLATE",
      "ELASTIC NARROW WOVEN 84%NYLON 16%RUBBER 32MM WHITE",
      "ELASTIC NARROW WOVEN 84%NYLON 16%RUBBER 25MM WHITE",
      "ELASTIC NARROW WOVEN ARROW 84%NYLON 16%SPANDEX 14MM WHITE",
      "ELASTIC NARROW WOVEN ARROW 84%NYLON 16%SPANDEX 18MM WHITE",
      "ELASTIC NARROW WOVEN FOLDING 77%NYLON 23%SPNDX 16MM ICEBERG GREEN",
      "ELASTIC NARROW WOVEN 84%NYLON 16%SPANDEX 25MM QUIAL",
      "BOW SATIN NYLON 6MM MAROON",
      "BOW SATIN NYLON 6MM MEDIEVAL BLUE",
      "BOW SATIN NYLON 6MM MAUVE",
      "BOW SATIN NYLON 6MM DEEP TAUPE",
      "BOW SATIN NYLON 6MM QUIAL",
      "BOW SATIN NYLON 6MM SEPLA ROSE",
      "BOW SATIN NYLON 6MM SLATE",
      "BOW SATIN NYLON 6MM CORONET BLUE",
      "ADJUSTER METAL COATED 10MM WHITE",
      "ADJUSTER METAL COATED 10MM NUDE",
      "RING METAL COATED 12MM WHITE",
      "ADJUSTER METAL COATED 12MM MEDIVIEVAL BLUE",
      "ADJUSTER METAL COATED 12MM BURL WOOD",
      "ADJUSTER METAL COATED 12MM DEEP TAUPE",
      "ADJUSTER METAL COATED 12MM QUIAL",
      "ADJUSTER METAL COATED 12MM SLATE",
      "ADJUSTER METAL COATED 12MM CORONET BLUE",
      "ADJUSTER METAL COATED 12MM SEPLA ROSE",
      "ADJUSTER METAL COATED 14MM WHITE",
      "RING-ADJUSTER NYLON-COATED 14MM BLACK",
      "ADJUSTER METAL COATED 14MM MEDIEVAL BLUE",
      "ADJUSTER METAL COATED 14MM NUDE",
      "ADJUSTER METAL COATED 14MM MAROON",
      "ADJUSTER METAL COATED 14MM BURL WOOD",
      "ADJUSTER METAL COATED 14MM DEEP TAUPE",
      "ADJUSTER METAL COATED 14MM QUIAL",
      "ADJUSTER METAL COATED 14MM CORONET BLUE",
      "ADJUSTER METAL COATED 14MM SEPLA ROSE",
      "ADJUSTER METAL COATED 14MM SLATE",
      "ADJUSTER METAL COATED 14MM ICEBERG GREEN",
      "ADJUSTER METAL COATED 14MM MAUVE",
      "ELASTIC MICRO NARROW WOVEN BUFF 84%NYLON 16%SPNDX 18MM QUIAL",
      "ELASTIC MICRO NARROW WOVEN BUFF 84%NYLON 16%SPNDX 12MM\xA0 QUIAL",
      "HOOK-EYE 3x3 MICRO FIBER NYLON- 100 GSM LINING - SS 44-55MM NON BRUSHED-FEATHERLITE RFD",
      "ELASTIC MICRO NARROW WOVEN BUFF 84%NYLON 16%SPNDX 12MM\xA0NUDE",
      "ELASTIC NARROW WOVEN BUFF 90%NYLON 10%SPNDX 10MM SN18-10 WHITE",
      "ELASTIC NARROW WOVEN FOLDING 77%NYLON 23%SPNDX 16MM NUDE",
      "CLOTH WOVEN 140324 136 EPI-72 PPI\xA0 96% Cotton 4% Spandex 40*40 Spandex 135 GSM 48 INCH Width MAROON",
      "ELASTIC NARROW WOVEN BUFF 84%NYLON 16%SPNDX 25MM WHITE"
    ],
    "COLOR": [
      "BLACK",
      "WHITE",
      "NUDE",
      "MIXED",
      "NAVY",
      "RED",
      "GREEN",
      "GREY",
      "BLUE",
      "SKIN",
      "MAROON"
    ],
    "SIZE": [
      "30",
      "32",
      "34",
      "36",
      "38",
      "40",
      "42",
      "44",
      "46",
      "S",
      "M",
      "L",
      "XL",
      "28",
      "XS",
      "XXL"
    ],
    "CUPSIZE": [
      "B",
      "C",
      "D",
      "E",
      "F",
      "G",
      "A"
    ],
    "DEFECTS": [
      "STAIN",
      "HOLE",
      "SHADING",
      "BROKEN STITCH",
      "SHADE VARIATION",
      "MEASUREMENT",
      "NEEDLE CUT",
      "SKIP STITCH",
      "DIRTY MARK",
      "OPEN SEAM",
      "PUCKERING",
      "OIL STAIN",
      "UNEVEN HEM",
      "RAW EDGE",
      "OTHER"
    ],
    "OPERATION": [
      "OP 1",
      "OP 2",
      "FRONT ATTACH",
      "BACK ATTACH",
      "SLEEVE ATTACH",
      "HEMMING",
      "NECK ATTACH",
      "CUP ATTACH",
      "STRAP ATTACH",
      "BOTTOM ELASTIC",
      "LABEL ATTACH",
      "SIDE SEAM",
      "HOOK & EYE ATTACH",
      "OTHER"
    ],
    "MACHINE": [
      "M001",
      "M002",
      "SNLS",
      "DNLS",
      "O/L",
      "F/L",
      "K/S",
      "BARTACK",
      "ZIGZAG",
      "FEED OF ARM",
      "BUTTON HOLE",
      "OTHER"
    ],
    "WORKERS": [
      "WORKER 1",
      "WORKER 2",
      "WORKER 3",
      "WORKER 4",
      "WORKER 5"
    ],
    "LINE": [
      "LINE 1",
      "LINE 2",
      "LINE 3",
      "LINE 4",
      "LINE 5",
      "SAMPLE ROOM",
      "TRAINING LINE"
    ],
    "STYLE_NAME": [
      "A 6",
      "A6 THIN",
      "ABSOLUTE PLUS",
      "AUTHENTIC BRA",
      "BRIDAL FOAM",
      "CARE U",
      "CIRCET BRA",
      "COOL FOAM",
      "ESSENTIAL BRA",
      "ETHNIC BRA",
      "FAVOURITE",
      "FULL MOON",
      "HAKO DSA",
      "HAKO LIFT",
      "HONEST BRA",
      "JASMINE",
      "LOVELY PAD",
      "MADAMS",
      "MAGNA FIT",
      "MAX SUPPORT",
      "MERCY SSU",
      "PLUS SIZE",
      "PRETTY PLUS",
      "PRIYA MOHINI",
      "PRIYA SAJINI",
      "PRIYA SP",
      "RINGLET",
      "RUBY",
      "SAREE BRA",
      "STYLE 1",
      "STYLE 2",
      "STYLE A",
      "STYLE B",
      "STYLE C",
      "TRUST ME",
      "TUNIC DSA",
      "WELL SUPPORT",
      "WOVEN RINGS"
    ],
    "ZONES": [
      "KERALA",
      "TIRUPUR",
      "BANGALORE"
    ],
    "UNITS": [
      "MUVATTUPUZHA",
      "ANGAMALY",
      "RAW MATERIAL STORE",
      "RAW MATERIAL STORE - TUP",
      "RAW MATERIAL STORE - BNGLR"
    ]
  }
};

// src/constants.ts
var ZONES = [
  "KERALA",
  "TIRUPUR",
  "BANGALORE"
];
var UNITS = [
  "MUVATTUPUZHA",
  "ANGAMALY",
  "RAW MATERIAL STORE",
  "RAW MATERIAL STORE - TUP",
  "RAW MATERIAL STORE - BNGLR"
];
var COLORS = [
  "BLACK",
  "WHITE",
  "NUDE",
  "MIXED",
  "NAVY",
  "RED",
  "GREEN",
  "GREY",
  "BLUE",
  "SKIN",
  "MAROON"
];
var SIZES = [
  "30",
  "32",
  "34",
  "36",
  "38",
  "40",
  "42",
  "44",
  "46",
  "S",
  "M",
  "L",
  "XL",
  "28",
  "XS",
  "XXL"
];
var DEFECTS = [
  "STAIN",
  "HOLE",
  "SHADING",
  "BROKEN STITCH",
  "SHADE VARIATION",
  "MEASUREMENT",
  "NEEDLE CUT",
  "SKIP STITCH",
  "DIRTY MARK",
  "OPEN SEAM",
  "PUCKERING",
  "OIL STAIN",
  "UNEVEN HEM",
  "RAW EDGE",
  "OTHER"
];
var OPERATIONS = [
  "OP 1",
  "OP 2",
  "FRONT ATTACH",
  "BACK ATTACH",
  "SLEEVE ATTACH",
  "HEMMING",
  "NECK ATTACH",
  "CUP ATTACH",
  "STRAP ATTACH",
  "BOTTOM ELASTIC",
  "LABEL ATTACH",
  "SIDE SEAM",
  "HOOK & EYE ATTACH",
  "OTHER"
];
var MACHINES = [
  "M001",
  "M002",
  "SNLS",
  "DNLS",
  "O/L",
  "F/L",
  "K/S",
  "BARTACK",
  "ZIGZAG",
  "FEED OF ARM",
  "BUTTON HOLE",
  "OTHER"
];
var CUPSIZES = [
  "B",
  "C",
  "D",
  "E",
  "F",
  "G",
  "A"
];
var STYLES = [
  "A 6",
  "A6 THIN",
  "ABSOLUTE PLUS",
  "AUTHENTIC BRA",
  "BRIDAL FOAM",
  "CARE U",
  "CIRCET BRA",
  "COOL FOAM",
  "ESSENTIAL BRA",
  "ETHNIC BRA",
  "FAVOURITE",
  "FULL MOON",
  "HAKO DSA",
  "HAKO LIFT",
  "HONEST BRA",
  "JASMINE",
  "LOVELY PAD",
  "MADAMS",
  "MAGNA FIT",
  "MAX SUPPORT",
  "MERCY SSU",
  "PLUS SIZE",
  "PRETTY PLUS",
  "PRIYA MOHINI",
  "PRIYA SAJINI",
  "PRIYA SP",
  "RINGLET",
  "RUBY",
  "SAREE BRA",
  "STYLE 1",
  "STYLE 2",
  "STYLE A",
  "STYLE B",
  "STYLE C",
  "TRUST ME",
  "TUNIC DSA",
  "WELL SUPPORT",
  "WOVEN RINGS"
];
var LINES = [
  "LINE 1",
  "LINE 2",
  "LINE 3",
  "LINE 4",
  "LINE 5",
  "SAMPLE ROOM",
  "TRAINING LINE"
];

// server.ts
var CONFIG_FILE = import_path.default.join(process.cwd(), ".gas_url");
var CONFIG_DRIVE_FILE = import_path.default.join(process.cwd(), ".gas_drive_url");
var SPREADSHEET_FILE = import_path.default.join(process.cwd(), ".gas_spreadsheet_id");
var USER_SHEET_URL = "https://script.google.com/macros/s/AKfycbwovJafP-4-u4uDOHWuJ-MCUh0-27aMbpUy2vebU3iPwwWkJGGp8DK65rrpQrxOQ1FOtg/exec";
var USER_DRIVE_URL = "https://script.google.com/macros/s/AKfycbyKWMLBVEs8L_5K-j4COuyNUGxngjs0NlG2Um3RuXwZZmIM5-lAof3sEfONj581y-lJ/exec";
var HARDCODED_GAS_URLS = [USER_SHEET_URL];
var HARDCODED_GAS_URL = USER_SHEET_URL;
var HARDCODED_DRIVE_URL = USER_DRIVE_URL;
try {
  if (!import_fs.default.existsSync(CONFIG_FILE) || import_fs.default.readFileSync(CONFIG_FILE, "utf8").includes("AKfycbzyJE21jeRLP") || import_fs.default.readFileSync(CONFIG_FILE, "utf8").includes("AKfycbxd") || import_fs.default.readFileSync(CONFIG_FILE, "utf8").includes("AKfycbwK") || import_fs.default.readFileSync(CONFIG_FILE, "utf8").includes("AKfycbzr") || import_fs.default.readFileSync(CONFIG_FILE, "utf8").includes("AKfycbzk") || import_fs.default.readFileSync(CONFIG_FILE, "utf8").includes("AKfycbwYSCpiux23UQp0I66XtYLC0STD494rcPN7FmOe6JsW4qym_gLbdNkpqvizbGKSfVqs")) {
    import_fs.default.writeFileSync(CONFIG_FILE, USER_SHEET_URL);
    console.log("[BOOT CONFIG] Auto-initialized permanent Google Sheets URL:", USER_SHEET_URL);
  }
  if (!import_fs.default.existsSync(CONFIG_DRIVE_FILE) || import_fs.default.readFileSync(CONFIG_DRIVE_FILE, "utf8").includes("AKfycbwK") || import_fs.default.readFileSync(CONFIG_DRIVE_FILE, "utf8").includes("AKfycbzr")) {
    import_fs.default.writeFileSync(CONFIG_DRIVE_FILE, USER_DRIVE_URL);
    console.log("[BOOT CONFIG] Auto-initialized permanent Google Drive URL:", USER_DRIVE_URL);
  }
  if (!import_fs.default.existsSync(SPREADSHEET_FILE) || import_fs.default.readFileSync(SPREADSHEET_FILE, "utf8").trim() === "") {
    import_fs.default.writeFileSync(SPREADSHEET_FILE, "BOUND_TO_SCRIPT");
    console.log("[BOOT CONFIG] Auto-initialized spreadsheet ID to BOUND_TO_SCRIPT");
  }
} catch (e) {
  console.warn("Could not auto-initialize .gas files:", e);
}
process.on("unhandledRejection", (reason, promise) => {
  console.warn("[SYSTEM SAFEGUARD] Unhandled Rejection at:", promise, "reason:", reason);
});
process.on("uncaughtException", (error) => {
  console.error("[SYSTEM SAFEGUARD] Uncaught Exception caught:", error);
});
var FIREBASE_API_KEY = "";
var FIREBASE_PROJECT_ID = "gen-lang-client-0333084315";
try {
  const firebaseConfigPath = import_path.default.join(process.cwd(), "firebase-applet-config.json");
  if (import_fs.default.existsSync(firebaseConfigPath)) {
    const config = JSON.parse(import_fs.default.readFileSync(firebaseConfigPath, "utf8"));
    if (config.apiKey) FIREBASE_API_KEY = config.apiKey;
    if (config.projectId) FIREBASE_PROJECT_ID = config.projectId;
  }
} catch (e) {
  console.warn("Failed to load firebase-applet-config.json on startup:", e);
}
var cachedFsConfig = null;
var lastFsFetchTime = 0;
var CACHE_TTL = 3 * 60 * 1e3;
var isFirestoreAvailable = true;
var isFirestoreChecked = false;
function handleFirestoreError(resStatus, resText) {
  if (resStatus === 404 || resStatus === 401 || resStatus === 403 || resText.includes("does not exist") || resText.includes("NOT_FOUND") || resText.includes("API keys are not supported")) {
    if (isFirestoreAvailable) {
      isFirestoreAvailable = false;
      console.log(`[FIRESTORE] Cloud Firestore database is not provisioned on project (${FIREBASE_PROJECT_ID}). BQOS is operating smoothly in primary Google Sheets & local persistent DB mode.`);
    }
    return true;
  }
  return false;
}
async function checkFirestoreAvailability() {
  if (isFirestoreChecked) return isFirestoreAvailable;
  isFirestoreChecked = true;
  if (!FIREBASE_API_KEY || !FIREBASE_PROJECT_ID) {
    isFirestoreAvailable = false;
    return false;
  }
  try {
    const keyParam = `?key=${FIREBASE_API_KEY}`;
    const url = `https://firestore.googleapis.com/v1/projects/${FIREBASE_PROJECT_ID}/databases/(default)/documents/system_config/ping${keyParam}`;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 2e3);
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeout);
    if (!res.ok) {
      const text = await res.text();
      handleFirestoreError(res.status, text);
    } else {
      isFirestoreAvailable = true;
    }
  } catch (e) {
    isFirestoreAvailable = false;
  }
  return isFirestoreAvailable;
}
var apiReadCache = /* @__PURE__ */ new Map();
var READ_CACHE_TTL = 3e4;
function clearApiReadCache() {
  apiReadCache.clear();
}
var urlHealthMap = /* @__PURE__ */ new Map();
function isUrlHealthy(url) {
  if (!url) return false;
  if (url === USER_SHEET_URL || url === USER_DRIVE_URL) return true;
  const health = urlHealthMap.get(url);
  if (!health) return true;
  if (health.isHealthy) return true;
  const now = Date.now();
  if (now - health.lastChecked > 15e3) {
    return true;
  }
  return false;
}
function markUrlHealth(url, ok, errorMsg) {
  if (!url) return;
  const existing = urlHealthMap.get(url) || { isHealthy: true, lastChecked: 0, failCount: 0 };
  if (ok) {
    existing.isHealthy = true;
    existing.failCount = 0;
    existing.lastChecked = Date.now();
    existing.lastError = void 0;
  } else {
    existing.failCount += 1;
    existing.lastChecked = Date.now();
    existing.lastError = errorMsg;
    if (existing.failCount >= 5 && url !== USER_SHEET_URL && url !== USER_DRIVE_URL) {
      existing.isHealthy = false;
    }
  }
  urlHealthMap.set(url, existing);
}
function mergeServerRecords(existing = [], incoming = []) {
  const map = /* @__PURE__ */ new Map();
  (existing || []).forEach((r) => {
    if (!r) return;
    const key = String(r.id || `${r.billNo || ""}_${r.grn || ""}_${r.itemName || ""}_${r.workorderNumber || r.wo || ""}_${r.checkingDate || r.date || ""}_${r.timestamp || ""}_${r.round || ""}_${r.bundleNo || ""}_${r.worker || ""}`);
    map.set(key, r);
  });
  (incoming || []).forEach((r) => {
    if (!r) return;
    const key = String(r.id || `${r.billNo || ""}_${r.grn || ""}_${r.itemName || ""}_${r.workorderNumber || r.wo || ""}_${r.checkingDate || r.date || ""}_${r.timestamp || ""}_${r.round || ""}_${r.bundleNo || ""}_${r.worker || ""}`);
    map.set(key, { ...map.get(key) || {}, ...r });
  });
  return Array.from(map.values());
}
async function syncGoogleSheetsData(quiet = false) {
  try {
    let url = USER_SHEET_URL;
    try {
      if (import_fs.default.existsSync(CONFIG_FILE)) {
        const fileUrl = import_fs.default.readFileSync(CONFIG_FILE, "utf8").trim();
        if (fileUrl && fileUrl.startsWith("https://script.google.com/macros/s/")) {
          url = fileUrl;
        }
      }
    } catch (e) {
    }
    if (!quiet) console.log("[SYNC] Performing live data sync from Google Sheets via", url);
    async function callSheet(action, params = [{ zone: "ALL" }]) {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8e3);
      try {
        const res = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action, params }),
          signal: controller.signal
        });
        clearTimeout(timeoutId);
        if (!res.ok) return null;
        const text = await res.text();
        if (text.trim().startsWith("<") || text.includes("Page not found")) return null;
        return JSON.parse(text);
      } catch (err) {
        clearTimeout(timeoutId);
        return null;
      }
    }
    const db = readLocalDb();
    const initData = await callSheet("api_getInitialData", [{ zone: "ALL" }]);
    if (initData) {
      if (Array.isArray(initData.users) && initData.users.length > 0) {
        db.users = initData.users;
      }
      if (Array.isArray(initData.workorders) && initData.workorders.length > 0) {
        const woMap = /* @__PURE__ */ new Map();
        (db.workorders || []).forEach((w) => {
          const k = String(w.id || w.workorderNumber || w.wo);
          woMap.set(k, w);
        });
        initData.workorders.forEach((w) => {
          const k = String(w.id || w.workorderNumber || w.wo);
          woMap.set(k, { ...woMap.get(k), ...w });
        });
        db.workorders = Array.from(woMap.values());
      }
      if (initData.settings) {
        db.settings = db.settings || {};
        db.settings["GLOBAL"] = initData.settings;
      }
    }
    const wos = await callSheet("api_getWorkorders", [{ zone: "ALL" }]);
    if (Array.isArray(wos) && wos.length > 0) {
      const woMap = /* @__PURE__ */ new Map();
      (db.workorders || []).forEach((w) => {
        const k = String(w.id || w.workorderNumber || w.wo);
        woMap.set(k, w);
      });
      wos.forEach((w) => {
        const k = String(w.id || w.workorderNumber || w.wo);
        woMap.set(k, { ...woMap.get(k), ...w });
      });
      db.workorders = Array.from(woMap.values());
    }
    const mat = await callSheet("api_getMaterialData");
    if (Array.isArray(mat) && mat.length > 0) {
      db.material_reports = mergeServerRecords(db.material_reports, mat);
    }
    const cut = await callSheet("api_getCuttingData");
    if (Array.isArray(cut) && cut.length > 0) {
      db.cutting_reports = mergeServerRecords(db.cutting_reports, cut);
    }
    const inline = await callSheet("api_getInlineData");
    if (Array.isArray(inline) && inline.length > 0) {
      db.sewing_reports = mergeServerRecords(db.sewing_reports, inline);
    }
    const endline = await callSheet("api_getEndlineData");
    if (Array.isArray(endline) && endline.length > 0) {
      db.endline_reports = mergeServerRecords(db.endline_reports, endline);
    }
    const aql = await callSheet("api_getAQLData");
    if (Array.isArray(aql) && aql.length > 0) {
      db.aql_reports = mergeServerRecords(db.aql_reports, aql);
    }
    const finalAudit = await callSheet("api_getFinalAuditData");
    if (Array.isArray(finalAudit) && finalAudit.length > 0) {
      db.final_reports = mergeServerRecords(db.final_reports, finalAudit);
    }
    const sop = await callSheet("api_getREPORTS_SOPData");
    if (Array.isArray(sop) && sop.length > 0) {
      db.reports_sop = mergeServerRecords(db.reports_sop, sop);
    }
    const zones = await callSheet("api_getZoneMappings");
    if (Array.isArray(zones) && zones.length > 0) {
      db.zone = zones;
    }
    const logs = await callSheet("api_getAdminLogs");
    if (Array.isArray(logs) && logs.length > 0) {
      db.admin_logs = mergeServerRecords(db.admin_logs, logs);
    }
    const complaints = await callSheet("api_getCustomerComplaints");
    if (Array.isArray(complaints)) {
      db.customer_complaints = mergeServerRecords(db.customer_complaints, complaints);
    }
    writeLocalDb(db);
    if (!quiet) console.log(`[SYNC] Live Google Sheets sync complete! Users: ${db.users?.length || 0}, Workorders: ${db.workorders?.length || 0}, Material: ${db.material_reports?.length || 0}, Cutting: ${db.cutting_reports?.length || 0}, Zones: ${db.zone?.length || 0}`);
  } catch (syncErr) {
    console.warn("[SYNC] Live Google Sheets sync notice:", syncErr.message);
  }
}
setTimeout(() => syncGoogleSheetsData(false), 2e3);
setInterval(() => syncGoogleSheetsData(true), 5 * 60 * 1e3);
async function getFirestoreConfig() {
  const now = Date.now();
  if (cachedFsConfig && now - lastFsFetchTime < CACHE_TTL) {
    return cachedFsConfig;
  }
  try {
    let localGasUrl = "";
    let localSpreadsheetId = "";
    let localGasDriveUrl = "";
    if (import_fs.default.existsSync(CONFIG_FILE)) localGasUrl = import_fs.default.readFileSync(CONFIG_FILE, "utf8").trim();
    if (import_fs.default.existsSync(SPREADSHEET_FILE)) localSpreadsheetId = import_fs.default.readFileSync(SPREADSHEET_FILE, "utf8").trim();
    if (import_fs.default.existsSync(CONFIG_DRIVE_FILE)) localGasDriveUrl = import_fs.default.readFileSync(CONFIG_DRIVE_FILE, "utf8").trim();
    if (localGasUrl && !localGasUrl.includes("AKfycbwK") && !localGasUrl.includes("AKfycbzr")) {
      cachedFsConfig = { gasUrl: localGasUrl, spreadsheetId: localSpreadsheetId || "BOUND_TO_SCRIPT", gasDriveUrl: localGasDriveUrl };
    }
  } catch (e) {
  }
  if (!isFirestoreAvailable || !FIREBASE_API_KEY || !FIREBASE_PROJECT_ID) {
    return cachedFsConfig;
  }
  (async () => {
    try {
      const queryParam = FIREBASE_API_KEY ? `?key=${FIREBASE_API_KEY}` : "";
      const url = `https://firestore.googleapis.com/v1/projects/${FIREBASE_PROJECT_ID}/databases/(default)/documents/system_config/global${queryParam}`;
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 1500);
      const res = await fetch(url, { signal: controller.signal });
      clearTimeout(timeout);
      if (res.ok) {
        const data = await res.json();
        const fields = data.fields || {};
        const gasUrl = fields.gasUrl?.stringValue || "";
        const spreadsheetId = fields.spreadsheetId?.stringValue || "";
        const gasDriveUrl = fields.gasDriveUrl?.stringValue || "";
        if (gasUrl) {
          cachedFsConfig = { gasUrl, spreadsheetId, gasDriveUrl };
          lastFsFetchTime = Date.now();
        }
      } else {
        const text = await res.text();
        handleFirestoreError(res.status, text);
      }
    } catch (e) {
    }
  })();
  return cachedFsConfig;
}
async function saveFirestoreConfig(gasUrl, spreadsheetId, gasDriveUrl = "", forceClear = false) {
  if (!isFirestoreAvailable || !FIREBASE_API_KEY || !FIREBASE_PROJECT_ID) {
    return;
  }
  try {
    let currentGasUrl = gasUrl;
    let currentSpreadsheetId = spreadsheetId;
    let currentGasDriveUrl = gasDriveUrl;
    if (!forceClear && (!currentGasUrl || !currentSpreadsheetId || !currentGasDriveUrl)) {
      const active = await getFirestoreConfig();
      if (active) {
        if (!currentGasUrl) currentGasUrl = active.gasUrl;
        if (!currentSpreadsheetId) currentSpreadsheetId = active.spreadsheetId;
        if (!currentGasDriveUrl) currentGasDriveUrl = active.gasDriveUrl || "";
      }
    }
    const fields = {};
    const fieldPaths = ["updatedAt"];
    fields.updatedAt = { stringValue: (/* @__PURE__ */ new Date()).toISOString() };
    if (currentGasUrl || forceClear) {
      fields.gasUrl = { stringValue: currentGasUrl || "" };
      fieldPaths.push("gasUrl");
    }
    if (currentSpreadsheetId || forceClear) {
      fields.spreadsheetId = { stringValue: currentSpreadsheetId || "" };
      fieldPaths.push("spreadsheetId");
    }
    if (currentGasDriveUrl || forceClear) {
      fields.gasDriveUrl = { stringValue: currentGasDriveUrl || "" };
      fieldPaths.push("gasDriveUrl");
    }
    const body = { fields };
    const maskParams = fieldPaths.map((p) => `updateMask.fieldPaths=${p}`).join("&");
    const keyParam = FIREBASE_API_KEY ? `&key=${FIREBASE_API_KEY}` : "";
    const patchUrl = `https://firestore.googleapis.com/v1/projects/${FIREBASE_PROJECT_ID}/databases/(default)/documents/system_config/global?${maskParams}${keyParam}`;
    const res = await fetch(patchUrl, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });
    if (res.ok) {
      console.log(`[SERVER FIRESTORE] Synced connection config (gasUrl: ${currentGasUrl}, spreadsheetId: ${currentSpreadsheetId}, gasDriveUrl: ${currentGasDriveUrl}) to Firestore.`);
      cachedFsConfig = { gasUrl: currentGasUrl, spreadsheetId: currentSpreadsheetId, gasDriveUrl: currentGasDriveUrl };
      lastFsFetchTime = Date.now();
    } else {
      const text = await res.text();
      if (!handleFirestoreError(res.status, text)) {
        console.warn("[SERVER FIRESTORE] Auto-sync PATCH failed:", text);
      }
    }
  } catch (e) {
    if (isFirestoreAvailable) {
      console.error("[SERVER FIRESTORE] Error auto-syncing config to Firestore:", e.message);
    }
  }
}
var LOCAL_DB_FILE = import_path.default.join(process.cwd(), ".local_db.json");
function sanitizeEndlineData(db) {
  if (!db || !Array.isArray(db.endline_reports)) return;
  db.workorders = db.workorders || [];
  const passSums = {};
  db.endline_reports.forEach((r) => {
    const woIdentifier = String(r.wo || r.workorderNumber || "").trim().toUpperCase();
    if (!woIdentifier) return;
    const matchedWO = db.workorders.find(
      (w) => String(w.workorderNumber || "").trim().toUpperCase() === woIdentifier || String(w.id || "").trim().toUpperCase() === woIdentifier
    );
    const targetQty = Number(matchedWO?.quantity || matchedWO?.orderQty || r.totalQty || 0);
    if (targetQty > 0) {
      const currentPassed = passSums[woIdentifier] || 0;
      const allowed = Math.max(0, targetQty - currentPassed);
      let pQty = Number(r.passQty) || 0;
      if (pQty > allowed) {
        pQty = allowed;
        r.passQty = String(pQty);
        if (Number(r.checkedQty) > 0 && Number(r.checkedQty) > pQty) {
          r.checkedQty = String(Math.max(pQty, Number(r.reworkQty || 0) + Number(r.failQty || 0)));
        }
      }
      passSums[woIdentifier] = currentPassed + pQty;
      r.totalQty = String(targetQty);
      r.openQty = String(Math.max(0, targetQty - passSums[woIdentifier]));
      if (passSums[woIdentifier] >= targetQty) {
        r.moveToAQL = true;
        if (matchedWO && matchedWO.status !== "FINAL" && matchedWO.status !== "COMPLETED") {
          matchedWO.status = "AQL";
        }
      }
    }
  });
}
function readLocalDb() {
  try {
    if (import_fs.default.existsSync(LOCAL_DB_FILE)) {
      const content = import_fs.default.readFileSync(LOCAL_DB_FILE, "utf8");
      if (content && content.trim() !== "") {
        const parsed = JSON.parse(content);
        if (parsed && typeof parsed === "object") {
          parsed.users = parsed.users || [];
          parsed.workorders = parsed.workorders || [];
          parsed.material_reports = parsed.material_reports || [];
          parsed.cutting_reports = parsed.cutting_reports || [];
          parsed.sewing_reports = parsed.sewing_reports || [];
          parsed.endline_reports = parsed.endline_reports || [];
          parsed.aql_reports = parsed.aql_reports || [];
          parsed.final_reports = parsed.final_reports || [];
          parsed.rework_reports = parsed.rework_reports || [];
          parsed.reports_sop = parsed.reports_sop || [];
          parsed.customer_complaints = parsed.customer_complaints || [];
          parsed.zone = parsed.zone || [];
          parsed.settings = parsed.settings || {};
          parsed.admin_logs = parsed.admin_logs || [];
          parsed.maintenance = parsed.maintenance || {
            enabled: false,
            message: "System is currently undergoing scheduled maintenance. Please check back shortly.",
            setAt: "",
            setBy: ""
          };
          if (parsed.workorders.length === 0 && INITIAL_DB?.workorders?.length > 0) {
            parsed.workorders = JSON.parse(JSON.stringify(INITIAL_DB.workorders));
          }
          if (parsed.material_reports.length === 0 && INITIAL_DB?.material_reports?.length > 0) {
            parsed.material_reports = JSON.parse(JSON.stringify(INITIAL_DB.material_reports));
          }
          if (parsed.cutting_reports.length === 0 && INITIAL_DB?.cutting_reports?.length > 0) {
            parsed.cutting_reports = JSON.parse(JSON.stringify(INITIAL_DB.cutting_reports));
          }
          if (parsed.endline_reports.length === 0 && INITIAL_DB?.endline_reports?.length > 0) {
            parsed.endline_reports = JSON.parse(JSON.stringify(INITIAL_DB.endline_reports));
          }
          if (parsed.users.length <= 3 && INITIAL_DB?.users?.length > 3) {
            parsed.users = JSON.parse(JSON.stringify(INITIAL_DB.users));
          }
          if ((!parsed.settings || Object.keys(parsed.settings).length === 0) && INITIAL_DB?.settings) {
            parsed.settings = JSON.parse(JSON.stringify(INITIAL_DB.settings));
          }
          if (parsed.settings) {
            parsed.settings.SETTINGS = parsed.settings.SETTINGS || {};
            parsed.settings.GLOBAL = parsed.settings.GLOBAL || {};
            parsed.settings.ITEMS = parsed.settings.ITEMS || parsed.settings.SETTINGS.ITEMS || parsed.settings.GLOBAL.ITEMS || [];
            parsed.settings.SUPPLIERS = parsed.settings.SUPPLIERS || parsed.settings.SUPPLIER || parsed.settings.SETTINGS.SUPPLIERS || parsed.settings.SETTINGS.SUPPLIER || [];
            parsed.settings.SUPPLIER = parsed.settings.SUPPLIERS;
            parsed.settings.SETTINGS.ITEMS = parsed.settings.ITEMS;
            parsed.settings.SETTINGS.SUPPLIERS = parsed.settings.SUPPLIERS;
            parsed.settings.SETTINGS.SUPPLIER = parsed.settings.SUPPLIERS;
            parsed.settings.GLOBAL.ITEMS = parsed.settings.ITEMS;
            parsed.settings.GLOBAL.SUPPLIERS = parsed.settings.SUPPLIERS;
            parsed.settings.GLOBAL.SUPPLIER = parsed.settings.SUPPLIERS;
          }
          if (parsed.zone.length === 0 && INITIAL_DB?.zone?.length > 0) {
            parsed.zone = JSON.parse(JSON.stringify(INITIAL_DB.zone));
          }
          sanitizeEndlineData(parsed);
          return parsed;
        }
      }
    }
  } catch (e) {
    console.error("[LOCAL DB] Error reading local db:", e);
  }
  const seed = JSON.parse(JSON.stringify(INITIAL_DB));
  seed.maintenance = seed.maintenance || {
    enabled: false,
    message: "System is currently undergoing scheduled maintenance. Please check back shortly.",
    setAt: "",
    setBy: ""
  };
  writeLocalDb(seed);
  return seed;
}
var activeUsers = /* @__PURE__ */ new Map();
function registerUserPresence(userData) {
  if (!userData || typeof userData !== "object") return;
  const rawCode = userData.userCode || userData.username || "";
  const userCode = String(rawCode).trim().toUpperCase();
  if (!userCode || userCode === "LOGIN" || userCode === "GUEST") return;
  const record = {
    id: userCode,
    userCode,
    username: String(userData.username || userCode),
    role: String(userData.role || "USER").toUpperCase(),
    zone: String(userData.zone || userData.location || "ALL"),
    location: String(userData.location || userData.zone || "ALL"),
    lastSeen: Date.now()
  };
  activeUsers.set(userCode, record);
  try {
    const db = readLocalDb();
    db.presence = db.presence || {};
    db.presence[userCode] = record;
    const cutoff = Date.now() - 5 * 60 * 1e3;
    for (const [k, v] of Object.entries(db.presence)) {
      if (!v || !v.lastSeen || v.lastSeen < cutoff) {
        delete db.presence[k];
      }
    }
    import_fs.default.writeFileSync(LOCAL_DB_FILE, JSON.stringify(db, null, 2), "utf8");
  } catch (e) {
  }
}
function getOnlineUsersList() {
  const now = Date.now();
  const threshold = 3 * 60 * 1e3;
  const userMap = /* @__PURE__ */ new Map();
  try {
    const db = readLocalDb();
    if (db.presence && typeof db.presence === "object") {
      for (const [key, record] of Object.entries(db.presence)) {
        if (record && record.lastSeen && now - record.lastSeen <= threshold) {
          userMap.set(key.toUpperCase(), record);
        }
      }
    }
  } catch (e) {
  }
  for (const [key, record] of activeUsers.entries()) {
    if (now - record.lastSeen <= threshold) {
      userMap.set(key.toUpperCase(), record);
    } else {
      activeUsers.delete(key);
    }
  }
  if (userMap.size === 0) {
    const adminRecord = {
      id: "A001",
      userCode: "A001",
      username: "admin",
      role: "ADMIN",
      zone: "ALL",
      location: "SYSTEM",
      lastSeen: now
    };
    userMap.set("A001", adminRecord);
  }
  return Array.from(userMap.values());
}
function isRecordMatchingZone(r, targetZone, zoneRows = [], workorders = []) {
  if (!r) return false;
  if (!targetZone || targetZone === "ALL" || targetZone === "SELECT..." || targetZone === "") return true;
  const clean = (s) => String(s || "").trim().toUpperCase().replace(/^(ZONE|UNIT|MODULE|ZMAP)[-\s]*/i, "").replace(/[^A-Z0-9]/g, "");
  const cTarget = clean(targetZone);
  if (!cTarget || cTarget === "ALL") return true;
  let rZone = String(r.zone || r.location || "").trim().toUpperCase();
  let rUnit = String(r.unit || "").trim().toUpperCase();
  if (!rZone && (r.workorderNumber || r.wo) && Array.isArray(workorders) && workorders.length > 0) {
    const targetWo = String(r.workorderNumber || r.wo).trim();
    const matchWo = workorders.find((w) => String(w.workorderNumber || w.wo || w.id).trim() === targetWo);
    if (matchWo) {
      rZone = String(matchWo.zone || matchWo.location || "").trim().toUpperCase();
      if (!rUnit) rUnit = String(matchWo.unit || "").trim().toUpperCase();
    }
  }
  if (!rZone && rUnit && Array.isArray(zoneRows) && zoneRows.length > 0) {
    const cUnit2 = clean(rUnit);
    const matchedZm = zoneRows.find((zm) => {
      const u = clean(zm.unit || "");
      return u && (u === cUnit2 || u.includes(cUnit2) || cUnit2.includes(u));
    });
    if (matchedZm && matchedZm.zone) {
      rZone = String(matchedZm.zone || "").trim().toUpperCase();
    }
  }
  const KNOWN_ZONES = ["KERALA", "TIRUPUR", "BANGALORE"];
  const cZone = clean(rZone);
  const cUnit = clean(rUnit);
  if (cZone && KNOWN_ZONES.includes(cZone) && KNOWN_ZONES.includes(cTarget) && cZone !== cTarget) {
    return false;
  }
  if (rZone === targetZone || rUnit === targetZone) return true;
  if (cZone && cZone === cTarget) return true;
  if (cUnit && cUnit === cTarget) return true;
  if (cZone && cZone.length >= 3 && (cZone.includes(cTarget) || cTarget.includes(cZone))) return true;
  if (cUnit && cUnit.length >= 3 && (cUnit.includes(cTarget) || cTarget.includes(cUnit))) return true;
  if (Array.isArray(zoneRows) && zoneRows.length > 0) {
    for (const zm of zoneRows) {
      const zmZone = clean(zm.zone || zm.id || "");
      const zmUnit = clean(zm.unit || "");
      if (zmZone === cTarget && zmUnit && cUnit && (zmUnit === cUnit || zmUnit.includes(cUnit) || cUnit.includes(zmUnit))) {
        return true;
      }
      if (zmUnit === cTarget && zmZone && cZone && (zmZone === cZone || zmZone.includes(cZone) || cZone.includes(zmZone))) {
        return true;
      }
    }
  }
  return false;
}
var TABLES = [
  "users",
  "workorders",
  "material_reports",
  "cutting_reports",
  "sewing_reports",
  "endline_reports",
  "aql_reports",
  "final_reports",
  "rework_reports",
  "reports_sop",
  "customer_complaints",
  "settings",
  "zone",
  "maintenance",
  "admin_logs"
];
var lastPushedData = {};
async function pushTableToFirestore(table, data) {
  if (!isFirestoreAvailable || !FIREBASE_API_KEY || !FIREBASE_PROJECT_ID) {
    return;
  }
  try {
    const jsonStr = JSON.stringify(data);
    if (lastPushedData[table] === jsonStr) {
      return;
    }
    lastPushedData[table] = jsonStr;
    const keyParam = FIREBASE_API_KEY ? `&key=${FIREBASE_API_KEY}` : "";
    const url = `https://firestore.googleapis.com/v1/projects/${FIREBASE_PROJECT_ID}/databases/(default)/documents/system_config/db_${table}?updateMask.fieldPaths=json${keyParam}`;
    const fields = { json: { stringValue: jsonStr } };
    const res = await fetch(url, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fields })
    });
    if (res.ok) {
      console.log(`[FIRESTORE PUSH] Synced table ${table} to Firestore cloud database.`);
    } else {
      const text = await res.text();
      if (!handleFirestoreError(res.status, text)) {
        console.warn(`[FIRESTORE PUSH] Failed to sync table ${table}:`, text);
      }
    }
  } catch (e) {
    if (isFirestoreAvailable) {
      console.error(`[FIRESTORE PUSH] Error syncing table ${table}:`, e.message);
    }
  }
}
async function pullFromFirestore() {
  if (!isFirestoreAvailable || !FIREBASE_API_KEY || !FIREBASE_PROJECT_ID) {
    return;
  }
  let db = {};
  try {
    if (import_fs.default.existsSync(LOCAL_DB_FILE)) {
      db = JSON.parse(import_fs.default.readFileSync(LOCAL_DB_FILE, "utf8"));
    }
  } catch (e) {
  }
  let changed = false;
  for (const table of TABLES) {
    if (!isFirestoreAvailable) break;
    try {
      const keyParam = FIREBASE_API_KEY ? `?key=${FIREBASE_API_KEY}` : "";
      const url = `https://firestore.googleapis.com/v1/projects/${FIREBASE_PROJECT_ID}/databases/(default)/documents/system_config/db_${table}${keyParam}`;
      const res = await fetch(url);
      if (res.ok) {
        const body = await res.json();
        const jsonStr = body.fields?.json?.stringValue;
        if (jsonStr) {
          const parsed = JSON.parse(jsonStr);
          if (Array.isArray(parsed) || typeof parsed === "object") {
            db[table] = parsed;
            changed = true;
          }
        }
      } else {
        const text = await res.text();
        if (handleFirestoreError(res.status, text)) {
          break;
        }
      }
    } catch (e) {
    }
  }
  if (changed) {
    console.log("[FIRESTORE PULL] Local DB successfully updated and synchronized with Firestore cloud documents.");
    try {
      import_fs.default.writeFileSync(LOCAL_DB_FILE, JSON.stringify(db, null, 2), "utf8");
    } catch (e) {
    }
  }
}
var lastPullTime = 0;
var PULL_INTERVAL = 15e3;
async function maybePullFromFirestore() {
  if (!isFirestoreAvailable) return;
  const now = Date.now();
  if (now - lastPullTime > PULL_INTERVAL) {
    lastPullTime = now;
    pullFromFirestore().catch((e) => {
      if (isFirestoreAvailable) console.error("[BG PULL] Error:", e);
    });
  }
}
function writeLocalDb(data) {
  try {
    clearApiReadCache();
    import_fs.default.writeFileSync(LOCAL_DB_FILE, JSON.stringify(data, null, 2), "utf8");
    for (const table of TABLES) {
      if (data[table] !== void 0) {
        pushTableToFirestore(table, data[table]);
      }
    }
  } catch (e) {
    console.error("[LOCAL DB] Error writing local db:", e);
  }
}
function getMasterCommonItems(db) {
  if (Array.isArray(db?.settings?.ITEMS) && db.settings.ITEMS.length > 0) {
    return db.settings.ITEMS;
  }
  if (Array.isArray(db?.settings?.SETTINGS?.ITEMS) && db.settings.SETTINGS.ITEMS.length > 0) {
    return db.settings.SETTINGS.ITEMS;
  }
  if (Array.isArray(db?.material_reports) && db.material_reports.length > 0) {
    const list = Array.from(new Set(db.material_reports.map((m) => String(m.itemName || m.item || m.ITEMS || "").trim()).filter((s) => s && s !== "ITEM 1" && s !== "ITEM 2")));
    if (list.length > 0) {
      db.settings = db.settings || {};
      db.settings.ITEMS = list;
      return list;
    }
  }
  return [];
}
function getMasterCommonSuppliers(db) {
  if (Array.isArray(db?.settings?.SUPPLIERS) && db.settings.SUPPLIERS.length > 0) {
    return db.settings.SUPPLIERS;
  }
  if (Array.isArray(db?.settings?.SUPPLIER) && db.settings.SUPPLIER.length > 0) {
    return db.settings.SUPPLIER;
  }
  if (Array.isArray(db?.settings?.SETTINGS?.SUPPLIER) && db.settings.SETTINGS.SUPPLIER.length > 0) {
    return db.settings.SETTINGS.SUPPLIER;
  }
  const supsFromUsers = [];
  (db?.users || []).forEach((u) => {
    let uS = u.userSettings;
    if (typeof uS === "string") {
      try {
        uS = JSON.parse(uS);
      } catch (e) {
      }
    }
    const list = uS ? uS.SUPPLIER || uS.SUPPLIERS || [] : [];
    if (Array.isArray(list) && list.length > 5) {
      supsFromUsers.push(...list);
    }
  });
  const unique = Array.from(new Set(supsFromUsers.map((s) => String(s || "").trim()).filter(Boolean)));
  if (unique.length > 0) {
    db.settings = db.settings || {};
    db.settings.SUPPLIERS = unique;
    db.settings.SUPPLIER = unique;
    return unique;
  }
  return [];
}
function getDynamicSettingsForServer(settings, db) {
  const finalSettings = { ...settings || {} };
  const zoneRows = db.zone || [];
  const zoneIdToNameMap = /* @__PURE__ */ new Map();
  for (const row of zoneRows) {
    const z = String(row.zone || "").trim().toUpperCase();
    const id = String(row.id || "").trim().toUpperCase();
    if (z.startsWith("ZMAP-") && id && !id.startsWith("ZMAP-")) {
      zoneIdToNameMap.set(z, id);
    } else if (id.startsWith("ZMAP-") && z && !z.startsWith("ZMAP-")) {
      zoneIdToNameMap.set(id, z);
    }
  }
  const dynamicZones = Array.from(
    new Set(
      zoneRows.map((z) => {
        let zVal = String(z.zone || "").trim().toUpperCase();
        if (zVal.startsWith("ZMAP-")) {
          zVal = zoneIdToNameMap.get(zVal) || zVal;
        }
        return zVal;
      }).filter((zVal) => zVal && !zVal.startsWith("ZMAP-"))
    )
  );
  const dynamicUnits = Array.from(
    new Set(
      zoneRows.filter((z) => String(z.unit || "").trim()).map((z) => String(z.unit || "").trim().toUpperCase()).filter(Boolean)
    )
  );
  finalSettings.ZONE = dynamicZones.length > 0 ? dynamicZones : Array.isArray(finalSettings.ZONE) && finalSettings.ZONE.length > 0 ? finalSettings.ZONE : ZONES;
  finalSettings.ZONES = dynamicZones.length > 0 ? dynamicZones : Array.isArray(finalSettings.ZONES) && finalSettings.ZONES.length > 0 ? finalSettings.ZONES : ZONES;
  finalSettings.UNIT = dynamicUnits.length > 0 ? dynamicUnits : Array.isArray(finalSettings.UNIT) && finalSettings.UNIT.length > 0 ? finalSettings.UNIT : UNITS;
  finalSettings.UNITS = dynamicUnits.length > 0 ? dynamicUnits : Array.isArray(finalSettings.UNITS) && finalSettings.UNITS.length > 0 ? finalSettings.UNITS : UNITS;
  const resolvedSuppliers = Array.isArray(finalSettings.SUPPLIERS) && finalSettings.SUPPLIERS.length > 0 ? finalSettings.SUPPLIERS : Array.isArray(finalSettings.SUPPLIER) && finalSettings.SUPPLIER.length > 0 ? finalSettings.SUPPLIER : getMasterCommonSuppliers(db);
  finalSettings.SUPPLIER = resolvedSuppliers;
  finalSettings.SUPPLIERS = resolvedSuppliers;
  const masterStylesList = db?.settings?.SETTINGS?.STYLE_NAME && Array.isArray(db.settings.SETTINGS.STYLE_NAME) && db.settings.SETTINGS.STYLE_NAME.length > 10 ? db.settings.SETTINGS.STYLE_NAME : db?.settings?.GLOBAL?.STYLE_NAME && Array.isArray(db.settings.GLOBAL.STYLE_NAME) && db.settings.GLOBAL.STYLE_NAME.length > 10 ? db.settings.GLOBAL.STYLE_NAME : STYLES;
  const isDummyStyles = !Array.isArray(finalSettings.STYLE_NAME) || finalSettings.STYLE_NAME.length === 0 || finalSettings.STYLE_NAME.length <= 2 && (finalSettings.STYLE_NAME[0] === "STYLE A" || finalSettings.STYLE_NAME[0] === "STYLE 1");
  finalSettings.STYLE_NAME = isDummyStyles ? masterStylesList : finalSettings.STYLE_NAME;
  const resolvedItems = Array.isArray(finalSettings.ITEMS) && finalSettings.ITEMS.length > 0 ? finalSettings.ITEMS : getMasterCommonItems(db);
  finalSettings.ITEMS = resolvedItems;
  const isDummyDefects = !Array.isArray(finalSettings.DEFECTS) || finalSettings.DEFECTS.length === 0 || finalSettings.DEFECTS.length <= 2 && (finalSettings.DEFECTS[0] === "DEFECT 1" || finalSettings.DEFECTS[0] === "DEFECT A");
  finalSettings.DEFECTS = isDummyDefects ? DEFECTS : finalSettings.DEFECTS;
  finalSettings.COLOR = Array.isArray(finalSettings.COLOR) && finalSettings.COLOR.length > 0 && finalSettings.COLOR[0] !== "COLOR 1" ? finalSettings.COLOR : COLORS;
  finalSettings.SIZE = Array.isArray(finalSettings.SIZE) && finalSettings.SIZE.length > 0 ? finalSettings.SIZE : SIZES;
  finalSettings.CUPSIZE = Array.isArray(finalSettings.CUPSIZE) && finalSettings.CUPSIZE.length > 0 ? finalSettings.CUPSIZE : CUPSIZES;
  finalSettings.OPERATION = Array.isArray(finalSettings.OPERATION) && finalSettings.OPERATION.length > 0 && finalSettings.OPERATION[0] !== "OP 1" ? finalSettings.OPERATION : OPERATIONS;
  finalSettings.MACHINE = Array.isArray(finalSettings.MACHINE) && finalSettings.MACHINE.length > 0 && finalSettings.MACHINE[0] !== "M001" ? finalSettings.MACHINE : MACHINES;
  finalSettings.LINE = Array.isArray(finalSettings.LINE) && finalSettings.LINE.length > 0 ? finalSettings.LINE : LINES;
  finalSettings.WORKERS = Array.isArray(finalSettings.WORKERS) && finalSettings.WORKERS.length > 0 ? finalSettings.WORKERS : ["WORKER 1", "WORKER 2", "WORKER 3", "WORKER 4", "WORKER 5"];
  return finalSettings;
}
function executeLocalAction(action, params) {
  console.log(`[LOCAL DB FALLBACK] Executing ${action} locally.`);
  maybePullFromFirestore();
  const db = readLocalDb();
  switch (action) {
    case "api_ping":
      return {
        success: true,
        status: "Connected (Local Fallback)",
        timestamp: (/* @__PURE__ */ new Date()).toISOString(),
        onlineCount: getOnlineUsersList().length,
        maintenance: db.maintenance || {
          enabled: false,
          message: "System is currently undergoing scheduled maintenance. Please check back shortly.",
          setAt: "",
          setBy: ""
        }
      };
    case "api_heartbeat": {
      const user = params[0];
      if (user) registerUserPresence(user);
      return {
        success: true,
        count: getOnlineUsersList().length,
        maintenance: db.maintenance || {
          enabled: false,
          message: "System is currently undergoing scheduled maintenance. Please check back shortly.",
          setAt: "",
          setBy: ""
        }
      };
    }
    case "api_getOnlineUsers": {
      const list = getOnlineUsersList();
      return { success: true, count: list.length, users: list };
    }
    case "api_getMaintenanceStatus": {
      const maintenanceLogs = (db.admin_logs || []).filter((l) => l.module === "SYSTEM" || String(l.action).includes("MAINTENANCE"));
      return {
        success: true,
        maintenance: db.maintenance || {
          enabled: false,
          message: "System is currently undergoing scheduled maintenance. Please check back shortly.",
          setAt: "",
          setBy: ""
        },
        logs: maintenanceLogs
      };
    }
    case "api_setMaintenanceStatus": {
      const param = params[0] || {};
      const enabled = typeof param === "boolean" ? param : !!param.enabled;
      const message = param.message && String(param.message).trim() || db.maintenance?.message || "System is currently undergoing scheduled maintenance. Please check back shortly.";
      const setBy = param.setBy || params[1] || "ADMIN";
      const nowIso = (/* @__PURE__ */ new Date()).toISOString();
      db.maintenance = {
        enabled,
        message,
        setAt: nowIso,
        setBy: String(setBy)
      };
      db.admin_logs = db.admin_logs || [];
      db.admin_logs.push({
        timestamp: nowIso,
        module: "SYSTEM",
        action: "MAINTENANCE_MODE",
        details: `Application turned ${enabled ? "OFF (Maintenance Active)" : "ON (System Live)"}: ${message}`,
        admin: String(setBy)
      });
      writeLocalDb(db);
      console.log(`[MAINTENANCE] Mode updated: enabled=${enabled}, by=${setBy}`);
      const maintenanceLogs = db.admin_logs.filter((l) => l.module === "SYSTEM" || String(l.action).includes("MAINTENANCE"));
      return {
        success: true,
        maintenance: db.maintenance,
        logs: maintenanceLogs
      };
    }
    case "api_getInitialData": {
      if (params[0]) registerUserPresence(params[0]);
      if (params[0]?.forceRefresh) {
        clearApiReadCache();
      }
      const zone = params[0]?.zone;
      const userCode = params[0]?.userCode;
      const allWOs = db.workorders || [];
      const userObj = (db.users || []).find(
        (u) => String(u.userCode || "").trim().toUpperCase() === String(userCode || "").trim().toUpperCase() || String(u.username || "").trim().toUpperCase() === String(userCode || "").trim().toUpperCase()
      );
      const userSpecificSettings = (userCode && db.settings ? db.settings[userCode] : null) || userObj?.userSettings;
      const masterGlobal = db.settings?.["SETTINGS"] || db.settings?.["GLOBAL"] || {};
      const globalSettings = db.settings?.["GLOBAL"] || masterGlobal;
      const rawSettings = { ...masterGlobal, ...globalSettings };
      const masterItems = getMasterCommonItems(db);
      const masterSuppliers = getMasterCommonSuppliers(db);
      rawSettings.ITEMS = masterItems;
      rawSettings.SUPPLIER = masterSuppliers;
      rawSettings.SUPPLIERS = masterSuppliers;
      const userRole = String(userObj?.role || params[0]?.role || "").toUpperCase();
      const CUSTOMIZABLE_KEYS = ["STYLE_NAME", "SIZE", "CUPSIZE", "COLOR", "LINE", "MACHINE", "OPERATION", "DEFECTS"];
      if (userObj && userRole !== "ADMIN") {
        CUSTOMIZABLE_KEYS.forEach((cat) => {
          const val = userSpecificSettings ? userSpecificSettings[cat] : void 0;
          if (Array.isArray(val)) {
            rawSettings[cat] = val.map((s) => String(s || "").trim()).filter(Boolean);
          } else if (typeof val === "string" && val.trim()) {
            rawSettings[cat] = val.split(/[\n,]+/).map((s) => s.trim()).filter(Boolean);
          } else {
            rawSettings[cat] = [];
          }
        });
        rawSettings.__isUserSettings = true;
      } else {
        CUSTOMIZABLE_KEYS.forEach((cat) => {
          const val = userSpecificSettings ? userSpecificSettings[cat] : void 0;
          if (Array.isArray(val) && val.length > 0) {
            rawSettings[cat] = val.map((s) => String(s || "").trim()).filter(Boolean);
          } else if (typeof val === "string" && val.trim()) {
            rawSettings[cat] = val.split(/[\n,]+/).map((s) => s.trim()).filter(Boolean);
          }
        });
      }
      const settings = getDynamicSettingsForServer(rawSettings, db);
      const userZone = String(userObj?.zone || userObj?.location || zone || "").trim().toUpperCase();
      if (userObj && userRole !== "ADMIN" && userZone && userZone !== "ALL" && userZone !== "SYSTEM" && userZone !== "COMMON") {
        settings.ZONE = [userZone];
        settings.ZONES = [userZone];
        const zoneRows = db.zone || [];
        const zoneUnits = Array.from(new Set(
          zoneRows.filter((z) => String(z.zone || "").trim().toUpperCase() === userZone && String(z.unit || "").trim()).map((z) => String(z.unit || "").trim().toUpperCase())
        ));
        if (zoneUnits.length > 0) {
          settings.UNIT = zoneUnits;
          settings.UNITS = zoneUnits;
        }
        const zoneWorkers = Array.from(new Set(
          zoneRows.filter((z) => String(z.zone || "").trim().toUpperCase() === userZone && String(z.worker || "").trim()).map((z) => String(z.worker || "").trim())
        ));
        if (zoneWorkers.length > 0) {
          settings.WORKERS = zoneWorkers;
        }
      }
      return {
        users: db.users || [],
        workorders: allWOs,
        settings,
        zone: db.zone || [],
        serverTime: (/* @__PURE__ */ new Date()).toISOString(),
        maintenance: db.maintenance || {
          enabled: false,
          message: "System is currently undergoing scheduled maintenance. Please check back shortly.",
          setAt: "",
          setBy: ""
        },
        onlineCount: getOnlineUsersList().length,
        success: true
      };
    }
    case "api_getUsers":
      return db.users || [];
    case "api_saveUser": {
      const user = params[0];
      const rawRestrictions = user.restrictions || [];
      const remappedRestrictions = rawRestrictions.includes("B10") ? Array.from(new Set(
        rawRestrictions.map((code) => {
          if (code === "B7") return null;
          if (code === "B8") return "B7";
          if (code === "B9") return "B8";
          if (code === "B10") return "B9";
          return code;
        }).filter(Boolean)
      )) : Array.from(new Set(rawRestrictions.filter(Boolean)));
      const structuredUser = {
        userCode: user.userCode,
        username: user.username,
        password: user.password,
        role: user.role,
        zone: user.zone || user.location || "",
        location: user.location || "",
        restrictions: remappedRestrictions,
        canDownload: user.canDownload !== false
      };
      db.users = db.users || [];
      db.users = db.users.filter((u) => u.userCode !== user.userCode);
      db.users.push(structuredUser);
      writeLocalDb(db);
      return { success: true };
    }
    case "api_updateUser": {
      const user = params[0];
      db.users = db.users || [];
      const idx = db.users.findIndex((u) => u.userCode === user.userCode);
      if (idx !== -1) {
        let remappedRestrictions = db.users[idx].restrictions;
        if (user.restrictions !== void 0) {
          const raw = user.restrictions;
          let list = [];
          if (Array.isArray(raw)) {
            list = raw.flatMap((item) => String(item || "").split(/[,;|\s]+/)).map((s) => s.trim().toUpperCase()).filter(Boolean);
          } else if (typeof raw === "string") {
            try {
              const parsed = JSON.parse(raw);
              if (Array.isArray(parsed)) {
                list = parsed.flatMap((item) => String(item || "").split(/[,;|\s]+/)).map((s) => s.trim().toUpperCase()).filter(Boolean);
              }
            } catch (e) {
            }
            if (list.length === 0) {
              list = raw.split(/[,;|\s]+/).map((s) => s.trim().toUpperCase()).filter(Boolean);
            }
          }
          if (list.includes("B10")) {
            list = list.map((c) => c === "B10" ? "B9" : c);
          }
          remappedRestrictions = Array.from(new Set(list));
        }
        db.users[idx] = {
          ...db.users[idx],
          ...user,
          zone: user.zone !== void 0 ? user.zone : db.users[idx].zone || user.location || "",
          restrictions: remappedRestrictions
        };
        writeLocalDb(db);
      }
      return { success: true };
    }
    case "api_deleteUser": {
      const userCode = params[0];
      db.users = db.users || [];
      db.users = db.users.filter((u) => u.userCode !== userCode);
      writeLocalDb(db);
      return { success: true };
    }
    case "api_getWorkorders": {
      const arg = params[0];
      const zone = typeof arg === "string" ? arg : arg?.zone;
      let workorders = db.workorders || [];
      if (zone && zone !== "ALL" && zone !== "WORKORDER") {
        const zoneRows = db.zone || [];
        const filtered = workorders.filter((w) => isRecordMatchingZone(w, String(zone).toUpperCase().trim(), zoneRows));
        if (filtered.length > 0) {
          workorders = filtered;
        }
      }
      return workorders;
    }
    case "api_saveWorkorder": {
      const wo = params[0];
      wo.id = wo.id || "wo-" + Math.random().toString(36).substr(2, 9);
      if (wo.workorderNumber && !wo.wo) wo.wo = wo.workorderNumber;
      if (wo.wo && !wo.workorderNumber) wo.workorderNumber = wo.wo;
      if (!wo.status) wo.status = "PRECUTTING";
      db.workorders = db.workorders || [];
      db.workorders.unshift(wo);
      writeLocalDb(db);
      return { success: true };
    }
    case "api_updateWorkorder": {
      const wo = params[0];
      if (wo.workorderNumber && !wo.wo) wo.wo = wo.workorderNumber;
      if (wo.wo && !wo.workorderNumber) wo.workorderNumber = wo.wo;
      db.workorders = db.workorders || [];
      const idx = db.workorders.findIndex(
        (w) => wo.id && String(w.id) === String(wo.id) || wo.workorderNumber && String(w.workorderNumber) === String(wo.workorderNumber) || wo.wo && (String(w.wo) === String(wo.wo) || String(w.workorderNumber) === String(wo.wo))
      );
      if (idx !== -1) {
        db.workorders[idx] = { ...db.workorders[idx], ...wo };
        writeLocalDb(db);
      }
      return { success: true };
    }
    case "api_deleteWorkorder": {
      const id = params[0];
      db.workorders = db.workorders || [];
      db.workorders = db.workorders.filter((w) => String(w.id) !== String(id));
      writeLocalDb(db);
      return { success: true };
    }
    case "api_getUserSettings":
    case "api_getSettings": {
      let target = params[0] || "GLOBAL";
      if (typeof target === "object" && target !== null) {
        target = target.userCode || target.target || target.sheetName || "GLOBAL";
      }
      const targetClean = String(target).trim().toUpperCase();
      db.settings = db.settings || {};
      const masterGlobal = db.settings["SETTINGS"] || db.settings["GLOBAL"] || {};
      const globalSettings = db.settings["GLOBAL"] || masterGlobal;
      const masterItems = getMasterCommonItems(db);
      const masterSuppliers = getMasterCommonSuppliers(db);
      if (targetClean === "GLOBAL" || targetClean === "SETTINGS") {
        const fullGlobal = getDynamicSettingsForServer({ ...masterGlobal, ...globalSettings, ITEMS: masterItems, SUPPLIER: masterSuppliers, SUPPLIERS: masterSuppliers }, db);
        return { success: true, settings: fullGlobal, ...fullGlobal };
      }
      const userObj = (db.users || []).find(
        (u) => String(u.userCode || "").trim().toUpperCase() === targetClean || String(u.username || "").trim().toUpperCase() === targetClean
      );
      const userSettings = (db.settings ? db.settings[target] : null) || userObj?.userSettings || {};
      const CUSTOMIZABLE_KEYS = ["STYLE_NAME", "SIZE", "CUPSIZE", "COLOR", "LINE", "MACHINE", "OPERATION", "DEFECTS"];
      const userResult = {
        ITEMS: masterItems,
        SUPPLIER: masterSuppliers,
        SUPPLIERS: masterSuppliers
      };
      CUSTOMIZABLE_KEYS.forEach((key) => {
        const val = userSettings[key];
        if (Array.isArray(val)) {
          userResult[key] = val.map((s) => String(s || "").trim()).filter(Boolean);
        } else if (typeof val === "string" && val.trim()) {
          userResult[key] = val.split(/[\n,]+/).map((s) => s.trim()).filter(Boolean);
        } else {
          userResult[key] = [];
        }
      });
      const zoneRows = db.zone || [];
      const dynamicZones = Array.from(new Set(zoneRows.map((z) => String(z.zone || "").trim().toUpperCase()).filter(Boolean)));
      userResult.ZONE = dynamicZones.length > 0 ? dynamicZones : masterGlobal.ZONE || ZONES;
      userResult.UNIT = Array.from(new Set(zoneRows.map((z) => String(z.unit || "").trim().toUpperCase()).filter(Boolean)));
      userResult.WORKERS = Array.from(new Set(zoneRows.map((z) => String(z.worker || "").trim()).filter(Boolean)));
      if (userObj && userObj.role !== "ADMIN") {
        const uZone = String(userObj.zone || userObj.location || "").trim().toUpperCase();
        if (uZone && uZone !== "ALL" && uZone !== "SYSTEM" && uZone !== "COMMON") {
          userResult.ZONE = [uZone];
          userResult.ZONES = [uZone];
          const zoneUnits = Array.from(new Set(
            zoneRows.filter((z) => String(z.zone || "").trim().toUpperCase() === uZone && String(z.unit || "").trim()).map((z) => String(z.unit || "").trim().toUpperCase())
          ));
          if (zoneUnits.length > 0) {
            userResult.UNIT = zoneUnits;
            userResult.UNITS = zoneUnits;
          }
          const zoneWorkers = Array.from(new Set(
            zoneRows.filter((z) => String(z.zone || "").trim().toUpperCase() === uZone && String(z.worker || "").trim()).map((z) => String(z.worker || "").trim())
          ));
          if (zoneWorkers.length > 0) {
            userResult.WORKERS = zoneWorkers;
          }
        }
      }
      return { success: true, settings: userResult, ...userResult };
    }
    case "api_saveUserSettings":
    case "api_saveSettings": {
      let target = params[0] || "GLOBAL";
      let payloadSettings = params[1] || {};
      if (typeof target === "object" && target !== null) {
        payloadSettings = target.settings || target.userSettings || payloadSettings;
        target = target.target || target.sheetName || target.userCode || "GLOBAL";
      }
      const targetClean = String(target).trim().toUpperCase();
      db.settings = db.settings || {};
      if (targetClean === "ITEMS" || targetClean === "ITEM") {
        const newItems = Array.isArray(payloadSettings) ? payloadSettings : payloadSettings.ITEMS || payloadSettings;
        const cleanItems = Array.isArray(newItems) ? newItems.map((s) => String(s || "").trim()).filter(Boolean) : [];
        db.settings.ITEMS = cleanItems;
        db.settings.SETTINGS = db.settings.SETTINGS || {};
        db.settings.GLOBAL = db.settings.GLOBAL || {};
        db.settings.SETTINGS.ITEMS = cleanItems;
        db.settings.GLOBAL.ITEMS = cleanItems;
      } else if (targetClean === "SUPPLIER" || targetClean === "SUPPLIERS") {
        const newSuppliers = Array.isArray(payloadSettings) ? payloadSettings : payloadSettings.SUPPLIER || payloadSettings.SUPPLIERS || payloadSettings;
        const cleanSuppliers = Array.isArray(newSuppliers) ? newSuppliers.map((s) => String(s || "").trim()).filter(Boolean) : [];
        db.settings.SUPPLIERS = cleanSuppliers;
        db.settings.SUPPLIER = cleanSuppliers;
        db.settings.SETTINGS = db.settings.SETTINGS || {};
        db.settings.GLOBAL = db.settings.GLOBAL || {};
        db.settings.SETTINGS.SUPPLIERS = cleanSuppliers;
        db.settings.SETTINGS.SUPPLIER = cleanSuppliers;
        db.settings.GLOBAL.SUPPLIERS = cleanSuppliers;
        db.settings.GLOBAL.SUPPLIER = cleanSuppliers;
      } else if (targetClean === "GLOBAL" || targetClean === "SETTINGS") {
        const currentGlobal = db.settings.GLOBAL || db.settings.SETTINGS || {};
        const updated = { ...currentGlobal, ...payloadSettings };
        if (payloadSettings.ITEMS && Array.isArray(payloadSettings.ITEMS)) {
          const cleanItems = payloadSettings.ITEMS.map((s) => String(s || "").trim()).filter(Boolean);
          updated.ITEMS = cleanItems;
          db.settings.ITEMS = cleanItems;
        }
        if (payloadSettings.SUPPLIERS && Array.isArray(payloadSettings.SUPPLIERS)) {
          const cleanSuppliers = payloadSettings.SUPPLIERS.map((s) => String(s || "").trim()).filter(Boolean);
          updated.SUPPLIERS = cleanSuppliers;
          updated.SUPPLIER = cleanSuppliers;
          db.settings.SUPPLIERS = cleanSuppliers;
          db.settings.SUPPLIER = cleanSuppliers;
        } else if (payloadSettings.SUPPLIER && Array.isArray(payloadSettings.SUPPLIER)) {
          const cleanSuppliers = payloadSettings.SUPPLIER.map((s) => String(s || "").trim()).filter(Boolean);
          updated.SUPPLIERS = cleanSuppliers;
          updated.SUPPLIER = cleanSuppliers;
          db.settings.SUPPLIERS = cleanSuppliers;
          db.settings.SUPPLIER = cleanSuppliers;
        }
        db.settings.GLOBAL = updated;
        db.settings.SETTINGS = updated;
      } else {
        const CUSTOMIZABLE = ["STYLE_NAME", "SIZE", "CUPSIZE", "COLOR", "LINE", "MACHINE", "OPERATION", "DEFECTS"];
        const userCustom = db.settings[target] || {};
        CUSTOMIZABLE.forEach((key) => {
          if (payloadSettings[key] !== void 0) {
            userCustom[key] = payloadSettings[key];
          }
        });
        delete userCustom.ITEMS;
        delete userCustom.ITEM;
        delete userCustom.SUPPLIER;
        delete userCustom.SUPPLIERS;
        delete userCustom.ZONE;
        delete userCustom.UNIT;
        delete userCustom.WORKERS;
        db.settings[target] = userCustom;
        const uIdx = (db.users || []).findIndex(
          (u) => String(u.userCode || "").trim().toUpperCase() === targetClean || String(u.username || "").trim().toUpperCase() === targetClean
        );
        if (uIdx !== -1) {
          db.users[uIdx].userSettings = userCustom;
        }
      }
      writeLocalDb(db);
      clearApiReadCache();
      return { success: true };
    }
    case "api_getAdminLogs":
      return db.admin_logs || [];
    case "api_getZoneMappings":
    case "api_getZoneMapping":
      return Array.isArray(db.zone) ? db.zone : [];
    case "api_saveZoneMapping":
    case "api_saveZoneMappings": {
      db.zone = db.zone || [];
      const record = params[0];
      record.id = record.id || "zmap-" + Math.random().toString(36).substr(2, 9);
      record.timestamp = record.timestamp || (/* @__PURE__ */ new Date()).toISOString();
      db.zone.push(record);
      const cleanNewZone = String(record.zone || "").trim().toUpperCase();
      if (cleanNewZone && db.settings) {
        Object.keys(db.settings).forEach((userKey) => {
          const uSet = db.settings[userKey];
          if (uSet) {
            ["ZONE", "ZONES"].forEach((zKey) => {
              if (Array.isArray(uSet[zKey])) {
                if (!uSet[zKey].includes(cleanNewZone)) {
                  uSet[zKey].push(cleanNewZone);
                }
              } else if (typeof uSet[zKey] === "string") {
                const parts = uSet[zKey].split("\n").map((s) => s.trim()).filter(Boolean);
                if (!parts.includes(cleanNewZone)) {
                  parts.push(cleanNewZone);
                  uSet[zKey] = parts.join("\n");
                }
              }
            });
          }
        });
      }
      writeLocalDb(db);
      return { success: true, record };
    }
    case "api_deleteZoneMapping":
    case "api_deleteZoneMappings": {
      const param = params[0];
      let targetIdStr = "";
      let targetZone = "";
      let targetUnit = "";
      let targetWorker = "";
      if (param && typeof param === "object") {
        targetIdStr = String(param.id || "").trim();
        targetZone = String(param.zone || "").trim().toUpperCase();
        targetUnit = String(param.unit || "").trim().toUpperCase();
        targetWorker = String(param.worker || "").trim().toUpperCase();
      } else {
        targetIdStr = String(param || "").trim();
      }
      db.zone = db.zone || [];
      if (targetWorker && targetUnit) {
        db.zone = db.zone.filter((z) => {
          const rWorker = String(z.worker || "").trim().toUpperCase();
          const rUnit = String(z.unit || "").trim().toUpperCase();
          const rZone = String(z.zone || "").trim().toUpperCase();
          if (targetIdStr && String(z.id || "").trim() === targetIdStr) {
            return false;
          }
          if (rWorker === targetWorker && rUnit === targetUnit && (!targetZone || rZone === targetZone)) {
            return false;
          }
          return true;
        });
      } else if (targetUnit && !targetWorker) {
        db.zone = db.zone.filter((z) => {
          const rUnit = String(z.unit || "").trim().toUpperCase();
          const rZone = String(z.zone || "").trim().toUpperCase();
          if (targetIdStr && String(z.id || "").trim() === targetIdStr) {
            return false;
          }
          if (rUnit === targetUnit && (!targetZone || rZone === targetZone)) {
            return false;
          }
          return true;
        });
      } else if (targetZone && !targetUnit && !targetWorker) {
        db.zone = db.zone.filter((z) => {
          const rZone = String(z.zone || "").trim().toUpperCase();
          if (targetIdStr && String(z.id || "").trim() === targetIdStr) {
            return false;
          }
          if (rZone === targetZone) {
            return false;
          }
          return true;
        });
        if (db.settings) {
          Object.keys(db.settings).forEach((userKey) => {
            const uSet = db.settings[userKey];
            if (uSet) {
              ["ZONE", "ZONES"].forEach((zKey) => {
                if (Array.isArray(uSet[zKey])) {
                  uSet[zKey] = uSet[zKey].filter((z) => String(z).trim().toUpperCase() !== targetZone);
                } else if (typeof uSet[zKey] === "string") {
                  uSet[zKey] = uSet[zKey].split("\n").filter((z) => String(z).trim().toUpperCase() !== targetZone).join("\n");
                }
              });
            }
          });
        }
      } else if (targetIdStr) {
        db.zone = db.zone.filter((z) => String(z.id || "").trim() !== targetIdStr);
      }
      writeLocalDb(db);
      return { success: true };
    }
    case "api_logAdminActivity": {
      const details = params[0];
      db.admin_logs = db.admin_logs || [];
      db.admin_logs.push({
        timestamp: (/* @__PURE__ */ new Date()).toISOString(),
        module: details.module || "SYSTEM",
        action: details.action || "ACTIVITY",
        details: details.details || "",
        admin: details.admin || "SYSTEM"
      });
      writeLocalDb(db);
      return { success: true };
    }
    case "api_saveMATERIALREPORT":
    case "api_saveMaterialReport": {
      db.material_reports = db.material_reports || [];
      const report = params[0];
      report.id = report.id || "mat-" + Math.random().toString(36).substr(2, 9);
      if (!report.timestamp) report.timestamp = (/* @__PURE__ */ new Date()).toISOString();
      db.material_reports.unshift(report);
      writeLocalDb(db);
      return { success: true };
    }
    case "api_saveCUTTINGQUALITY":
    case "api_saveCuttingReport": {
      db.cutting_reports = db.cutting_reports || [];
      const report = params[0];
      report.id = report.id || "cut-" + Math.random().toString(36).substr(2, 9);
      if (!report.timestamp) report.timestamp = (/* @__PURE__ */ new Date()).toISOString();
      db.workorders = db.workorders || [];
      const woTarget = report.workorderNumber || report.wo;
      const matchedWO = db.workorders.find((w) => String(w.id) === String(woTarget) || String(w.workorderNumber) === String(woTarget));
      if (matchedWO) {
        report.wo = matchedWO.workorderNumber;
        report.workorderNumber = matchedWO.workorderNumber;
      }
      db.cutting_reports.unshift(report);
      if (matchedWO) {
        let nextStatus = "INLINE_AND_ENDLINE";
        if (report.submodule === "PRECUTTING") {
          nextStatus = report.passAndHold === true || report.passAndHold === "true" ? "PRECUTTING_PASS_AND_HOLD" : "CUTTING";
        } else {
          nextStatus = report.passAndHold === true || report.passAndHold === "true" ? "CUTTING_PASS_AND_HOLD" : "INLINE_AND_ENDLINE";
        }
        matchedWO.status = nextStatus;
      }
      writeLocalDb(db);
      return { success: true };
    }
    case "api_saveSEWINGDEFECT":
    case "api_saveInlineReport": {
      db.sewing_reports = db.sewing_reports || [];
      const report = params[0];
      report.id = report.id || "sew-" + Math.random().toString(36).substr(2, 9);
      if (!report.timestamp) report.timestamp = (/* @__PURE__ */ new Date()).toISOString();
      db.sewing_reports.unshift(report);
      if (report.moveToEndline && report.wo) {
        db.workorders = db.workorders || [];
        const woIdx = db.workorders.findIndex((w) => String(w.workorderNumber) === String(report.wo));
        if (woIdx !== -1) db.workorders[woIdx].status = "ENDLINE";
      }
      writeLocalDb(db);
      return { success: true };
    }
    case "api_save8ROUNDSYSTEM": {
      db.sewing_reports = db.sewing_reports || [];
      const report = params[0];
      const duplicateIdx = db.sewing_reports.findIndex((r) => {
        const rWorker = String(r.worker || r.operator || "").trim().toUpperCase();
        const sWorker = String(report.worker || "").trim().toUpperCase();
        const rRoundIdx = Number(r.roundIndex || 0);
        const sRoundIdx = Number(report.roundIndex || 0);
        const rRound = String(r.round || "").trim().toUpperCase().replace(/[^A-Z0-9]/g, "");
        const sRound = String(report.round || "").trim().toUpperCase().replace(/[^A-Z0-9]/g, "");
        const normalizeDateSimple = (dVal) => {
          if (!dVal) return "";
          let s = String(dVal).trim();
          if (s.includes("T")) {
            try {
              const d = new Date(s);
              if (!isNaN(d.getTime())) {
                const istTime = new Date(d.getTime() + 5.5 * 60 * 60 * 1e3);
                const year = istTime.getUTCFullYear();
                const month = String(istTime.getUTCMonth() + 1).padStart(2, "0");
                const day = String(istTime.getUTCDate()).padStart(2, "0");
                return `${year}-${month}-${day}`;
              }
            } catch (e) {
            }
          }
          const datePartOnly = s.split(/[ T]/)[0].replace(/[\/.]/g, "-");
          const p = datePartOnly.split("-");
          if (p.length === 3) {
            const p0 = p[0].padStart(2, "0");
            const p1 = p[1].padStart(2, "0");
            if (p[2].length === 4) {
              return `${p[2]}-${p1}-${p0}`;
            }
            if (p[0].length === 4) {
              return `${p[0]}-${p1}-${p[2].padStart(2, "0")}`;
            }
          }
          return datePartOnly;
        };
        const rDateNorm = normalizeDateSimple(r.checkingDate || r.date || r.timestamp || r.createdAt || r.createdAt);
        const sDateNorm = normalizeDateSimple(report.checkingDate || report.date || report.timestamp || report.createdAt || report.createdAt);
        const rParts = rDateNorm.split("-");
        const sParts = sDateNorm.split("-");
        let dateMatches = rDateNorm === sDateNorm;
        if (!dateMatches && rParts.length === 3 && sParts.length === 3 && rParts[0] === sParts[0]) {
          const rm = rParts[1], rd = rParts[2];
          const sm = sParts[1], sd = sParts[2];
          if (rm === sm && rd === sd || rm === sd && rd === sm) {
            dateMatches = true;
          }
        }
        const rZone = String(r.zone || r.location || "").trim().toUpperCase();
        const sZone = String(report.zone || "").trim().toUpperCase();
        const roundMatches = rRoundIdx === sRoundIdx || rRound === sRound && rRound !== "";
        return rWorker === sWorker && roundMatches && dateMatches && (rZone === sZone || sZone === "" || rZone === "") && rWorker !== "";
      });
      if (duplicateIdx !== -1) {
        return {
          success: false,
          error: `A quality check has already been logged for worker "${report.worker}" in Round ${report.round} on this date. Re-submission is blocked.`
        };
      }
      report.id = report.id || "sew-" + Math.random().toString(36).substr(2, 9);
      if (!report.timestamp) report.timestamp = (/* @__PURE__ */ new Date()).toISOString();
      db.sewing_reports.unshift(report);
      writeLocalDb(db);
      return { success: true };
    }
    case "api_update8ROUNDSYSTEM": {
      db.sewing_reports = db.sewing_reports || [];
      const report = params[0];
      const idx = db.sewing_reports.findIndex((r) => String(r.id) === String(report.id));
      if (idx !== -1) {
        db.sewing_reports[idx] = { ...db.sewing_reports[idx], ...report };
        writeLocalDb(db);
        return { success: true };
      }
      return { success: false, error: "Record not found" };
    }
    case "api_saveENDLINEQUALITY":
    case "api_saveEndlineReport": {
      db.endline_reports = db.endline_reports || [];
      const report = params[0] || {};
      report.id = report.id || "end-" + Math.random().toString(36).substr(2, 9);
      if (!report.timestamp) report.timestamp = (/* @__PURE__ */ new Date()).toISOString();
      const woIdentifier = String(report.wo || report.workorderNumber || "").trim();
      db.workorders = db.workorders || [];
      const matchedWO = db.workorders.find(
        (w) => String(w.workorderNumber || "").trim().toUpperCase() === woIdentifier.toUpperCase() || String(w.id || "").trim().toUpperCase() === woIdentifier.toUpperCase()
      );
      const targetQty = Number(matchedWO?.quantity || matchedWO?.orderQty || report.totalQty || 0);
      if (targetQty > 0) {
        const existingPassed = db.endline_reports.filter((r) => {
          const rWo = String(r.wo || r.workorderNumber || "").trim().toUpperCase();
          return rWo === woIdentifier.toUpperCase() && String(r.id) !== String(report.id);
        }).reduce((sum, r) => sum + (Number(r.passQty) || 0), 0);
        const remaining = Math.max(0, targetQty - existingPassed);
        const attemptedPass = Number(report.passQty) || 0;
        if (attemptedPass > remaining) {
          report.passQty = String(remaining);
          if (Number(report.checkedQty) > 0 && Number(report.checkedQty) >= attemptedPass) {
            report.checkedQty = String(remaining);
          }
        }
        const newTotalPassed = existingPassed + (Number(report.passQty) || 0);
        report.totalQty = String(targetQty);
        report.openQty = String(Math.max(0, targetQty - newTotalPassed));
        if (newTotalPassed >= targetQty) {
          report.moveToAQL = true;
          if (matchedWO && matchedWO.status !== "FINAL" && matchedWO.status !== "COMPLETED") {
            matchedWO.status = "AQL";
          }
        }
      }
      const existingIdx = db.endline_reports.findIndex((r) => String(r.id) === String(report.id));
      if (existingIdx !== -1) {
        db.endline_reports[existingIdx] = { ...db.endline_reports[existingIdx], ...report };
      } else {
        db.endline_reports.unshift(report);
      }
      if (report.moveToAQL && woIdentifier) {
        const woIdx = db.workorders.findIndex(
          (w) => String(w.workorderNumber || "").trim().toUpperCase() === woIdentifier.toUpperCase() || String(w.id || "").trim().toUpperCase() === woIdentifier.toUpperCase()
        );
        if (woIdx !== -1 && db.workorders[woIdx].status !== "FINAL" && db.workorders[woIdx].status !== "COMPLETED") {
          db.workorders[woIdx].status = "AQL";
        }
      }
      writeLocalDb(db);
      return { success: true, id: report.id };
    }
    case "api_saveAQLREPORT": {
      db.aql_reports = db.aql_reports || [];
      const report = params[0];
      report.id = report.id || "aql-" + Math.random().toString(36).substr(2, 9);
      if (!report.timestamp) report.timestamp = (/* @__PURE__ */ new Date()).toISOString();
      db.workorders = db.workorders || [];
      const woTarget = report.workorderNumber || report.wo;
      const matchedWO = db.workorders.find((w) => String(w.id) === String(woTarget) || String(w.workorderNumber) === String(woTarget));
      if (matchedWO) {
        report.wo = matchedWO.workorderNumber;
        report.workorderNumber = matchedWO.workorderNumber;
      }
      db.aql_reports.unshift(report);
      if (matchedWO && (report.moveToFinal || report.auditStatus === "PASS")) {
        matchedWO.status = report.passAndHold === true || report.passAndHold === "true" ? "AQL_PASS_AND_HOLD" : "FINAL";
      }
      writeLocalDb(db);
      return { success: true };
    }
    case "api_saveFINALAUDIT": {
      db.final_reports = db.final_reports || [];
      const report = params[0];
      report.id = report.id || "fin-" + Math.random().toString(36).substr(2, 9);
      if (!report.timestamp) report.timestamp = (/* @__PURE__ */ new Date()).toISOString();
      db.workorders = db.workorders || [];
      const woTarget = report.workorderNumber || report.wo;
      const matchedWO = db.workorders.find((w) => String(w.id) === String(woTarget) || String(w.workorderNumber) === String(woTarget));
      if (matchedWO) {
        report.wo = matchedWO.workorderNumber;
        report.workorderNumber = matchedWO.workorderNumber;
      }
      db.final_reports.unshift(report);
      if (matchedWO) {
        matchedWO.status = report.moveToComplete ? "COMPLETED" : report.passAndHold === true || report.passAndHold === "true" ? "FINAL_PASS_AND_HOLD" : "COMPLETED";
      }
      writeLocalDb(db);
      return { success: true };
    }
    case "api_saveREWORK":
    case "api_saveReworkReport": {
      db.rework_reports = db.rework_reports || [];
      const report = params[0];
      report.id = report.id || "rew-" + Math.random().toString(36).substr(2, 9);
      if (!report.timestamp) report.timestamp = (/* @__PURE__ */ new Date()).toISOString();
      db.rework_reports.unshift(report);
      writeLocalDb(db);
      return { success: true };
    }
    case "aggregateZonedData": {
      const moduleName = params[0] || "CUTTING";
      const zoneArg = params[1] || (typeof params[0] === "object" ? params[0]?.zone : void 0);
      let key = "cutting_reports";
      const mUpper = String(moduleName).toUpperCase();
      if (mUpper.includes("MATERIAL")) key = "material_reports";
      else if (mUpper.includes("INLINE") || mUpper.includes("8ROUND")) key = "sewing_reports";
      else if (mUpper.includes("ENDLINE")) key = "endline_reports";
      else if (mUpper.includes("AQL")) key = "aql_reports";
      else if (mUpper.includes("FINAL")) key = "final_reports";
      let data = db[key] || [];
      if (zoneArg && zoneArg !== "ALL") {
        const zTarget = String(zoneArg).trim().toUpperCase();
        data = data.filter((r) => {
          const rZone = String(r.zone || r.location || "").trim().toUpperCase();
          const rUnit = String(r.unit || "").trim().toUpperCase();
          if (rZone === zTarget || rUnit === zTarget) return true;
          const clean = (s) => s.replace(/^(ZONE|UNIT|MODULE|ZMAP)[-\s]*/i, "").replace(/[^A-Z0-9]/g, "");
          const cTarget = clean(zTarget);
          if (cTarget && (clean(rZone) === cTarget || clean(rUnit) === cTarget)) return true;
          return rZone.includes(zTarget) || zTarget.includes(rZone);
        });
      }
      return data;
    }
    case "api_getMaterialData": {
      const zoneArg = typeof params[0] === "string" ? params[0] : params[0]?.zone;
      let data = db.material_reports || [];
      const zClean = String(zoneArg || "").trim().toUpperCase();
      if (zClean && zClean !== "ALL" && zClean !== "COMMON" && zClean !== "SYSTEM" && zClean !== "WORKORDER" && zClean !== "SELECT...") {
        const zoneRows = db.zone || [];
        data = data.filter((r) => isRecordMatchingZone(r, zClean, zoneRows, db.workorders || []));
      }
      return data;
    }
    case "api_getCuttingData": {
      const zoneArg = typeof params[0] === "string" ? params[0] : params[0]?.zone;
      let data = db.cutting_reports || [];
      const zClean = String(zoneArg || "").trim().toUpperCase();
      if (zClean && zClean !== "ALL" && zClean !== "COMMON" && zClean !== "SYSTEM" && zClean !== "WORKORDER" && zClean !== "SELECT...") {
        const zoneRows = db.zone || [];
        data = data.filter((r) => isRecordMatchingZone(r, zClean, zoneRows, db.workorders || []));
      }
      return data;
    }
    case "api_getInlineData": {
      const zoneArg = typeof params[0] === "string" ? params[0] : params[0]?.zone;
      let data = db.sewing_reports || [];
      const zClean = String(zoneArg || "").trim().toUpperCase();
      if (zClean && zClean !== "ALL" && zClean !== "COMMON" && zClean !== "SYSTEM" && zClean !== "WORKORDER" && zClean !== "SELECT...") {
        const zoneRows = db.zone || [];
        data = data.filter((r) => isRecordMatchingZone(r, zClean, zoneRows, db.workorders || []));
      }
      return data;
    }
    case "api_get8ROUNDSYSTEMData": {
      const zoneArg = typeof params[0] === "string" ? params[0] : params[0]?.zone;
      let data = db.sewing_reports || [];
      const zClean = String(zoneArg || "").trim().toUpperCase();
      if (zClean && zClean !== "ALL" && zClean !== "COMMON" && zClean !== "SYSTEM" && zClean !== "WORKORDER" && zClean !== "SELECT...") {
        const zoneRows = db.zone || [];
        data = data.filter((r) => isRecordMatchingZone(r, zClean, zoneRows, db.workorders || []));
      }
      return data;
    }
    case "api_getEndlineData": {
      const zoneArg = typeof params[0] === "string" ? params[0] : params[0]?.zone;
      let data = db.endline_reports || [];
      const zClean = String(zoneArg || "").trim().toUpperCase();
      if (zClean && zClean !== "ALL" && zClean !== "COMMON" && zClean !== "SYSTEM" && zClean !== "WORKORDER" && zClean !== "SELECT...") {
        const zoneRows = db.zone || [];
        data = data.filter((r) => isRecordMatchingZone(r, zClean, zoneRows, db.workorders || []));
      }
      return data;
    }
    case "api_getAQLData": {
      const zoneArg = typeof params[0] === "string" ? params[0] : params[0]?.zone;
      let data = db.aql_reports || [];
      const zClean = String(zoneArg || "").trim().toUpperCase();
      if (zClean && zClean !== "ALL" && zClean !== "COMMON" && zClean !== "SYSTEM" && zClean !== "WORKORDER" && zClean !== "SELECT...") {
        const zoneRows = db.zone || [];
        data = data.filter((r) => isRecordMatchingZone(r, zClean, zoneRows, db.workorders || []));
      }
      return data;
    }
    case "api_getFinalAuditData": {
      const zoneArg = typeof params[0] === "string" ? params[0] : params[0]?.zone;
      let data = db.final_reports || [];
      const zClean = String(zoneArg || "").trim().toUpperCase();
      if (zClean && zClean !== "ALL" && zClean !== "COMMON" && zClean !== "SYSTEM" && zClean !== "WORKORDER" && zClean !== "SELECT...") {
        const zoneRows = db.zone || [];
        data = data.filter((r) => isRecordMatchingZone(r, zClean, zoneRows, db.workorders || []));
      }
      return data;
    }
    case "api_deleteMaterialData": {
      const id = params[0];
      db.material_reports = (db.material_reports || []).filter((r) => String(r.id) !== String(id));
      writeLocalDb(db);
      return { success: true };
    }
    case "api_deleteCuttingData": {
      const id = params[0];
      db.cutting_reports = (db.cutting_reports || []).filter((r) => String(r.id) !== String(id));
      writeLocalDb(db);
      return { success: true };
    }
    case "api_deleteInlineData": {
      const id = params[0];
      db.sewing_reports = (db.sewing_reports || []).filter((r) => String(r.id) !== String(id));
      writeLocalDb(db);
      return { success: true };
    }
    case "api_deleteEndlineData": {
      const id = params[0];
      db.endline_reports = (db.endline_reports || []).filter((r) => String(r.id) !== String(id));
      writeLocalDb(db);
      return { success: true };
    }
    case "api_deleteAQLData": {
      const id = params[0];
      db.aql_reports = (db.aql_reports || []).filter((r) => String(r.id) !== String(id));
      writeLocalDb(db);
      return { success: true };
    }
    case "api_deleteFinalAuditData": {
      const id = params[0];
      db.final_reports = (db.final_reports || []).filter((r) => String(r.id) !== String(id));
      writeLocalDb(db);
      return { success: true };
    }
    case "api_getREPORTS_SOPData": {
      const zone = params[0]?.zone;
      const userCode = params[0]?.userCode;
      const userRole = params[0]?.userRole;
      const username = params[0]?.username;
      let data = db.reports_sop || [];
      if (zone && zone !== "ALL" && zone !== "COMMON" && userRole !== "ADMIN") {
        const targetZone = String(zone).trim().toUpperCase();
        const filtered = data.filter((r) => {
          const rZone = String(r.zone || r.location || "").trim().toUpperCase();
          return !rZone || rZone === targetZone || rZone === "ALL" || rZone === "COMMON";
        });
        if (filtered.length > 0) {
          data = filtered;
        }
      }
      const deletedList = db.deleted_sop_ids || [];
      return [...data, { id: "__DELETED_SOP_IDS__", deletedList }];
    }
    case "api_saveREPORTS_SOP": {
      db.reports_sop = db.reports_sop || [];
      const report = params[0];
      report.id = report.id || "sop-" + Math.random().toString(36).substr(2, 9);
      if (!report.timestamp) report.timestamp = (/* @__PURE__ */ new Date()).toISOString();
      const existingIdx = db.reports_sop.findIndex(
        (r) => report.id && String(r.id) === String(report.id) || report.driveFileId && r.driveFileId && String(r.driveFileId) === String(report.driveFileId) || report.title && r.title && String(r.title).trim().toLowerCase() === String(report.title).trim().toLowerCase() && r.attachmentUrl === report.attachmentUrl
      );
      if (existingIdx !== -1) {
        db.reports_sop[existingIdx] = { ...db.reports_sop[existingIdx], ...report };
      } else {
        db.reports_sop.unshift(report);
      }
      writeLocalDb(db);
      return { success: true, id: report.id };
    }
    case "api_deleteREPORTS_SOP": {
      const id = params[0];
      const sops = db.reports_sop || [];
      const itemToDelete = sops.find((r) => String(r.id) === String(id));
      if (itemToDelete && itemToDelete.attachmentUrl && itemToDelete.attachmentUrl.startsWith("/uploads/")) {
        const fileName = itemToDelete.attachmentUrl.replace("/uploads/", "");
        const filePath = import_path.default.join(process.cwd(), "uploads", fileName);
        if (import_fs.default.existsSync(filePath)) {
          try {
            import_fs.default.unlinkSync(filePath);
            console.log(`[LOCAL SAVER via API] Successfully deleted physical file at: ${filePath}`);
          } catch (err) {
            console.error(`[LOCAL SAVER via API ERROR] Failed to delete file at: ${filePath}`, err);
          }
        }
      }
      db.reports_sop = sops.filter((r) => String(r.id) !== String(id));
      db.deleted_sop_ids = db.deleted_sop_ids || [];
      if (!db.deleted_sop_ids.includes(String(id))) {
        db.deleted_sop_ids.push(String(id));
      }
      writeLocalDb(db);
      return { success: true };
    }
    case "api_uploadSOPFile": {
      try {
        const fileName = params[0];
        const rawBase64 = params[1];
        const mimeType = params[2];
        if (!fileName || !rawBase64) {
          return { success: false, error: "Missing physical fileName or base64Data contents." };
        }
        const cleanBase64 = rawBase64.replace(/^data:.*;base64,/, "");
        const buffer = Buffer.from(cleanBase64, "base64");
        const timestamp = Date.now();
        const safeName = `${timestamp}-${fileName.replace(/[^a-zA-Z0-9.-]/g, "_")}`;
        const uploadsDir = import_path.default.join(process.cwd(), "uploads");
        if (!import_fs.default.existsSync(uploadsDir)) {
          import_fs.default.mkdirSync(uploadsDir, { recursive: true });
        }
        const filePath = import_path.default.join(uploadsDir, safeName);
        import_fs.default.writeFileSync(filePath, buffer);
        const relativeUrl = `/uploads/${safeName}`;
        console.log(`[LOCAL SAVER via API] PDF uploaded successfully. Saved locally to: ${filePath}`);
        return {
          success: true,
          url: relativeUrl,
          downloadUrl: relativeUrl,
          id: `local-${timestamp}`,
          name: safeName
        };
      } catch (e) {
        console.error("[LOCAL SAVER via API ERROR]", e);
        return { success: false, error: e.message || "Failed to save file on server." };
      }
    }
    case "api_bulkSave": {
      const sheetName = String(params[0] || "").toUpperCase();
      const records = params[1] || [];
      records.forEach((r) => {
        r.id = r.id || "bulk-" + Math.random().toString(36).substr(2, 9);
        if (!r.timestamp) r.timestamp = (/* @__PURE__ */ new Date()).toISOString();
      });
      const keyMap = {
        "USERS": "users",
        "WORKORDER": "workorders",
        "MATERIAL REPORT": "material_reports",
        "CUTTING QUALITY": "cutting_reports",
        "INLINE": "sewing_reports",
        "SEWING DEFECT": "sewing_reports",
        "8ROUND SYSTEM": "sewing_reports",
        "ENDLINE QUALITY": "endline_reports",
        "AQL REPORT": "aql_reports",
        "FINAL AUDIT": "final_reports",
        "REWORK": "rework_reports",
        "ADMIN": "admin_logs"
      };
      const dbKey = keyMap[sheetName] || sheetName;
      db[dbKey] = db[dbKey] || [];
      if (sheetName.includes("ENDLINE")) {
        records.forEach((r) => {
          const woIdentifier = String(r.wo || r.workorderNumber || "").trim();
          if (woIdentifier) {
            db.workorders = db.workorders || [];
            const matchedWO = db.workorders.find(
              (w) => String(w.workorderNumber || "").trim().toUpperCase() === woIdentifier.toUpperCase() || String(w.id || "").trim().toUpperCase() === woIdentifier.toUpperCase()
            );
            const targetQty = Number(matchedWO?.quantity || matchedWO?.orderQty || r.totalQty || 0);
            if (targetQty > 0) {
              const existingPassed = db.endline_reports.filter((er) => {
                const rWo = String(er.wo || er.workorderNumber || "").trim().toUpperCase();
                return rWo === woIdentifier.toUpperCase() && String(er.id) !== String(r.id);
              }).reduce((sum, er) => sum + (Number(er.passQty) || 0), 0);
              const remaining = Math.max(0, targetQty - existingPassed);
              const attemptedPass = Number(r.passQty) || 0;
              if (attemptedPass > remaining) {
                r.passQty = String(remaining);
                if (Number(r.checkedQty) > 0 && Number(r.checkedQty) >= attemptedPass) {
                  r.checkedQty = String(remaining);
                }
              }
              const newTotalPassed = existingPassed + (Number(r.passQty) || 0);
              r.totalQty = String(targetQty);
              r.openQty = String(Math.max(0, targetQty - newTotalPassed));
              if (newTotalPassed >= targetQty) {
                r.moveToAQL = true;
                if (matchedWO && matchedWO.status !== "FINAL" && matchedWO.status !== "COMPLETED") {
                  matchedWO.status = "AQL";
                }
              }
            }
          }
        });
      }
      db[dbKey].push(...records);
      writeLocalDb(db);
      return { success: true, count: records.length };
    }
    case "api_getCustomerComplaints": {
      let data = db.customer_complaints || [];
      const zoneArg = typeof params[0] === "string" ? params[0] : params[0]?.zone;
      if (zoneArg && zoneArg !== "ALL") {
        const zTarget = String(zoneArg).trim().toUpperCase();
        data = data.filter((r) => {
          const rZone = String(r.zone || r.location || "").trim().toUpperCase();
          return !rZone || rZone === "ALL" || rZone === zTarget;
        });
      }
      return data;
    }
    case "api_saveCustomerComplaint": {
      db.customer_complaints = db.customer_complaints || [];
      const complaint = params[0] || {};
      const id = complaint.id || "cc-" + Date.now() + "-" + Math.random().toString(36).substr(2, 7);
      complaint.id = id;
      if (!complaint.timestamp) complaint.timestamp = (/* @__PURE__ */ new Date()).toISOString();
      const existingIndex = db.customer_complaints.findIndex((item) => String(item.id) === String(id));
      if (existingIndex !== -1) {
        db.customer_complaints[existingIndex] = { ...db.customer_complaints[existingIndex], ...complaint };
      } else {
        db.customer_complaints.unshift(complaint);
      }
      writeLocalDb(db);
      return { success: true, id };
    }
    case "api_deleteCustomerComplaint": {
      const id = params[0];
      db.customer_complaints = db.customer_complaints || [];
      db.customer_complaints = db.customer_complaints.filter((item) => String(item.id) !== String(id));
      writeLocalDb(db);
      return { success: true };
    }
    case "api_saveMaterialReportBulk": {
      const data = params[0] || {};
      const { zone, billNo, supplierName, grn, checkingDate, receivedDate, remarks, inspector, timestamp, items } = data;
      if (!items || !Array.isArray(items)) return { success: true, count: 0 };
      const mappedItems = items.map((item) => ({
        zone: zone || "",
        billNo: billNo || "",
        supplierName: supplierName || "",
        grn: grn || "",
        receivedDate: receivedDate || "",
        checkingDate: checkingDate || "",
        itemName: item.itemName || "",
        receivedQuantity: item.receivedQuantity || 0,
        checkedQuantity: item.checkedQuantity || 0,
        passQuantity: item.passQuantity || 0,
        rejectedQuantity: item.rejectedQuantity || 0,
        itemRemarks: item.remarks || "",
        generalRemarks: remarks || "",
        inspector: inspector || "",
        timestamp: timestamp || (/* @__PURE__ */ new Date()).toISOString(),
        id: "bulk-" + Math.random().toString(36).substr(2, 9)
      }));
      db.material_reports = db.material_reports || [];
      db.material_reports.unshift(...mappedItems);
      writeLocalDb(db);
      return { success: true, count: items.length, total: items.length };
    }
    case "api_getDataBySheet": {
      const sheetName = String(params[0] || "").trim().toUpperCase();
      if (sheetName === "ITEMS" || sheetName === "ITEM") {
        const items = getMasterCommonItems(db);
        return items.map((it) => ({ ITEMS: it, itemName: it, id: it }));
      }
      if (sheetName === "SUPPLIERS" || sheetName === "SUPPLIER") {
        const sups = getMasterCommonSuppliers(db);
        return sups.map((s) => ({ SUPPLIERS: s, supplierName: s, id: s }));
      }
      if (sheetName === "USERS") return db.users || [];
      if (sheetName === "ZONE") return db.zone || [];
      if (sheetName === "UNIT") return db.unit || [];
      if (sheetName === "MATERIAL REPORT" || sheetName === "MATERIAL") return db.material_reports || [];
      if (sheetName === "SETTINGS") return [db.settings?.SETTINGS || db.settings?.GLOBAL || {}];
      return [];
    }
    default:
      console.warn(`[LOCAL DB FALLBACK] Unknown action requested: ${action}`);
      return { success: false, error: `Method ${action} not supported locally.` };
  }
}
async function startServer() {
  readLocalDb();
  await checkFirestoreAvailability();
  if (isFirestoreAvailable) {
    console.log("[BOOT] Pulling latest table data from Firestore cloud database...");
    await pullFromFirestore().catch(() => {
    });
  }
  try {
    const fsConfig = await getFirestoreConfig();
    if (fsConfig) {
      if (fsConfig.gasUrl && (fsConfig.gasUrl.includes("AKfycbzyJE21jeRLP") || fsConfig.gasUrl.includes("AKfycbwK"))) {
        await saveFirestoreConfig(USER_SHEET_URL, fsConfig.spreadsheetId || "BOUND_TO_SCRIPT", fsConfig.gasDriveUrl || "");
        console.log(`[BOOT AUTO-HEAL] Updated Firestore GAS URL to new endpoint: ${USER_SHEET_URL}`);
      } else if (fsConfig.gasUrl && !import_fs.default.existsSync(CONFIG_FILE)) {
        import_fs.default.writeFileSync(CONFIG_FILE, fsConfig.gasUrl.trim());
        console.log(`[BOOT AUTO-HEAL] Restored missing GAS URL from Firestore: ${fsConfig.gasUrl}`);
      }
      if (fsConfig.spreadsheetId && !import_fs.default.existsSync(SPREADSHEET_FILE)) {
        import_fs.default.writeFileSync(SPREADSHEET_FILE, fsConfig.spreadsheetId.trim());
        console.log(`[BOOT AUTO-HEAL] Restored missing SPREADSHEET ID from Firestore: ${fsConfig.spreadsheetId}`);
      }
      if (fsConfig.gasDriveUrl && !import_fs.default.existsSync(CONFIG_DRIVE_FILE)) {
        import_fs.default.writeFileSync(CONFIG_DRIVE_FILE, fsConfig.gasDriveUrl.trim());
        console.log(`[BOOT AUTO-HEAL] Restored missing GAS DRIVE URL from Firestore: ${fsConfig.gasDriveUrl}`);
      }
    }
  } catch (err) {
    console.warn("[BOOT AUTO-HEAL] Non-blocking Firestore auto-heal warning:", err.message);
  }
  const app = (0, import_express.default)();
  const PORT = 3e3;
  app.use(import_express.default.json({ limit: "50mb" }));
  app.use(import_express.default.urlencoded({ extended: true, limit: "50mb" }));
  app.get("/api/config", async (req, res) => {
    let fileUrl = null;
    let fileSpreadsheetId = null;
    let fileDriveUrl = null;
    try {
      if (import_fs.default.existsSync(CONFIG_FILE)) {
        fileUrl = import_fs.default.readFileSync(CONFIG_FILE, "utf8").trim();
      }
      if (import_fs.default.existsSync(SPREADSHEET_FILE)) {
        fileSpreadsheetId = import_fs.default.readFileSync(SPREADSHEET_FILE, "utf8").trim();
      }
      if (import_fs.default.existsSync(CONFIG_DRIVE_FILE)) {
        fileDriveUrl = import_fs.default.readFileSync(CONFIG_DRIVE_FILE, "utf8").trim();
      }
    } catch (e) {
    }
    let fsUrl = "";
    let fsSpreadsheetId = "";
    let fsDriveUrl = "";
    const fsConfig = await getFirestoreConfig();
    if (fsConfig) {
      fsUrl = fsConfig.gasUrl;
      fsSpreadsheetId = fsConfig.spreadsheetId;
      fsDriveUrl = fsConfig.gasDriveUrl || "";
      if (fsUrl && fsUrl !== fileUrl && !fsUrl.includes("AKfycbzyJE21jeRLP") && !fsUrl.includes("AKfycbwK")) {
        try {
          import_fs.default.writeFileSync(CONFIG_FILE, fsUrl.trim());
          console.log(`[AUTO-HEAL SERVER] Recreated CONFIG_FILE from Firestore: ${fsUrl}`);
          fileUrl = fsUrl;
        } catch (e) {
        }
      }
      if (fsSpreadsheetId && fsSpreadsheetId !== fileSpreadsheetId) {
        try {
          import_fs.default.writeFileSync(SPREADSHEET_FILE, fsSpreadsheetId.trim());
          console.log(`[AUTO-HEAL SERVER] Recreated SPREADSHEET_FILE from Firestore: ${fsSpreadsheetId}`);
          fileSpreadsheetId = fsSpreadsheetId;
        } catch (e) {
        }
      }
      if (fsDriveUrl && fsDriveUrl !== fileDriveUrl) {
        try {
          import_fs.default.writeFileSync(CONFIG_DRIVE_FILE, fsDriveUrl.trim());
          console.log(`[AUTO-HEAL SERVER] Recreated CONFIG_DRIVE_FILE from Firestore: ${fsDriveUrl}`);
          fileDriveUrl = fsDriveUrl;
        } catch (e) {
        }
      }
    }
    const envUrl = process.env.VITE_GAS_URL;
    const hasEnv = !!envUrl && !envUrl.includes("REPLACE_WITH");
    const finalUrlExists = hasEnv || !!fileUrl || !!fsUrl || !!HARDCODED_GAS_URL;
    res.json({
      hasGasUrl: finalUrlExists,
      gasUrlPlaceholder: envUrl?.includes("REPLACE_WITH"),
      isPermanent: !!fileUrl || hasEnv || !!fsUrl || !!HARDCODED_GAS_URL,
      source: fileUrl ? "file" : fsUrl ? "firestore" : hasEnv ? "env" : "hardcoded",
      gasUrl: fileUrl || fsUrl || (hasEnv ? envUrl : HARDCODED_GAS_URL),
      spreadsheetId: fileSpreadsheetId || fsSpreadsheetId || process.env.VITE_SPREADSHEET_ID || "BOUND_TO_SCRIPT",
      gasDriveUrl: fileDriveUrl || fsDriveUrl || HARDCODED_DRIVE_URL || ""
    });
  });
  app.get("/api/code-gs", (req, res) => {
    try {
      const codePath = import_path.default.join(process.cwd(), "Code.gs");
      if (import_fs.default.existsSync(codePath)) {
        const content = import_fs.default.readFileSync(codePath, "utf8");
        res.setHeader("Content-Type", "text/plain");
        return res.send(content);
      }
      res.status(404).send("Code.gs not found");
    } catch (e) {
      res.status(500).send("Failed to read Code.gs: " + e.message);
    }
  });
  const driveImageCache = /* @__PURE__ */ new Map();
  const MAX_CACHE_ITEMS = 200;
  const CACHE_TTL_MS = 1e3 * 60 * 60 * 24;
  app.get("/api/drive-proxy", async (req, res) => {
    try {
      let driveId = String(req.query.id || req.query.driveId || "").trim();
      const rawUrl = String(req.query.url || "").trim();
      if (!driveId && rawUrl) {
        const matchD = rawUrl.match(/\/d\/([a-zA-Z0-9_-]{20,})/i);
        const matchId = rawUrl.match(/[?&]id=([a-zA-Z0-9_-]{20,})/i);
        const matchLh3 = rawUrl.match(/googleusercontent\.com\/d\/([a-zA-Z0-9_-]{20,})/i);
        driveId = matchD && matchD[1] || matchId && matchId[1] || matchLh3 && matchLh3[1] || "";
        if (!driveId && /^[a-zA-Z0-9_-]{20,60}$/.test(rawUrl)) {
          driveId = rawUrl;
        }
      }
      if (!driveId) {
        return res.status(400).send("Missing Google Drive file ID or URL parameter.");
      }
      const isDownloadReq = req.query.download === "true" || req.query.dl === "1";
      const customFilename = typeof req.query.filename === "string" && req.query.filename.trim() ? req.query.filename.trim() : "";
      const cached = driveImageCache.get(driveId);
      if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
        res.setHeader("Content-Type", cached.contentType);
        res.setHeader("Cache-Control", "public, max-age=604800, immutable");
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("X-Cache", "HIT");
        if (isDownloadReq) {
          const ext = cached.contentType.includes("pdf") ? ".pdf" : cached.contentType.includes("png") ? ".png" : ".jpg";
          const dlName = customFilename || `file-${driveId}${ext}`;
          res.setHeader("Content-Disposition", `attachment; filename="${dlName}"`);
        }
        return res.send(cached.buffer);
      }
      const candidateUrls = [
        `https://drive.google.com/uc?export=download&id=${driveId}`,
        `https://drive.google.com/uc?export=view&id=${driveId}`,
        `https://lh3.googleusercontent.com/d/${driveId}=s1600`,
        `https://drive.google.com/thumbnail?id=${driveId}&sz=w1600`
      ];
      for (const targetUrl of candidateUrls) {
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 8e3);
          const response = await fetch(targetUrl, {
            headers: {
              "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
              "Accept": "application/pdf,image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8"
            },
            redirect: "follow",
            signal: controller.signal
          });
          clearTimeout(timeoutId);
          if (response.ok) {
            const contentType = response.headers.get("content-type") || "";
            const isImage = contentType.startsWith("image/");
            const isPdf = contentType.includes("pdf") || contentType.startsWith("application/pdf");
            const isOctet = contentType.includes("octet-stream") || contentType.includes("binary");
            if (isImage || isPdf || isOctet) {
              const arrayBuffer = await response.arrayBuffer();
              const buffer = Buffer.from(arrayBuffer);
              const resolvedContentType = isImage ? contentType : isPdf ? "application/pdf" : "image/jpeg";
              if (driveImageCache.size >= MAX_CACHE_ITEMS) {
                const oldestKey = driveImageCache.keys().next().value;
                if (oldestKey) driveImageCache.delete(oldestKey);
              }
              driveImageCache.set(driveId, { buffer, contentType: resolvedContentType, timestamp: Date.now() });
              res.setHeader("Content-Type", resolvedContentType);
              res.setHeader("Cache-Control", "public, max-age=604800, immutable");
              res.setHeader("Access-Control-Allow-Origin", "*");
              res.setHeader("X-Cache", "MISS");
              if (isDownloadReq) {
                const ext = isPdf ? ".pdf" : resolvedContentType.includes("png") ? ".png" : ".jpg";
                const dlName = customFilename || `file-${driveId}${ext}`;
                res.setHeader("Content-Disposition", `attachment; filename="${dlName}"`);
              }
              return res.send(buffer);
            }
          }
        } catch (fetchErr) {
        }
      }
      return res.redirect(`https://drive.google.com/thumbnail?id=${driveId}&sz=w1200`);
    } catch (err) {
      console.error("[DRIVE PROXY] Error proxying Google Drive file:", err);
      res.status(500).send("Failed to proxy image");
    }
  });
  app.post("/api/save-config", async (req, res) => {
    const { url, spreadsheetId, driveUrl } = req.body;
    try {
      if (url) {
        if (!url.startsWith("https://script.google.com/macros/s/")) {
          return res.status(400).json({ success: false, error: "Invalid Google Script URL" });
        }
        import_fs.default.writeFileSync(CONFIG_FILE, url.trim());
        console.log(`[CONFIG] Permanent GAS URL saved to ${CONFIG_FILE}`);
      }
      if (spreadsheetId) {
        import_fs.default.writeFileSync(SPREADSHEET_FILE, spreadsheetId.trim());
        console.log(`[CONFIG] Permanent Spreadsheet ID saved to ${SPREADSHEET_FILE}`);
      }
      if (driveUrl) {
        if (!driveUrl.startsWith("https://script.google.com/macros/s/")) {
          return res.status(400).json({ success: false, error: "Invalid Google Drive Script URL" });
        }
        import_fs.default.writeFileSync(CONFIG_DRIVE_FILE, driveUrl.trim());
        console.log(`[CONFIG] Permanent GAS DRIVE URL saved to ${CONFIG_DRIVE_FILE}`);
      }
      try {
        await saveFirestoreConfig(url || "", spreadsheetId || "", driveUrl || "");
      } catch (fsErr) {
        console.warn("[CONFIG] Non-blocking Firestore sync warning:", fsErr.message);
      }
      res.json({ success: true, message: "Configuration saved permanently on server" });
    } catch (e) {
      console.error("[CONFIG] Failed to save config:", e);
      res.status(500).json({ success: false, error: "Failed to write configuration to server storage: " + e.message });
    }
  });
  app.post("/api/clear-config", async (req, res) => {
    try {
      if (import_fs.default.existsSync(CONFIG_FILE)) {
        try {
          import_fs.default.unlinkSync(CONFIG_FILE);
        } catch (e) {
        }
      }
      if (import_fs.default.existsSync(SPREADSHEET_FILE)) {
        try {
          import_fs.default.unlinkSync(SPREADSHEET_FILE);
        } catch (e) {
        }
      }
      if (import_fs.default.existsSync(CONFIG_DRIVE_FILE)) {
        try {
          import_fs.default.unlinkSync(CONFIG_DRIVE_FILE);
        } catch (e) {
        }
      }
      cachedFsConfig = null;
      lastFsFetchTime = 0;
      await saveFirestoreConfig("", "", "", true);
      console.log("[CONFIG] Cleared configuration files and Firestore backup permanently.");
      res.json({ success: true, message: "Configuration cleared permanently on server" });
    } catch (e) {
      console.error("[CONFIG] Failed to clear config:", e);
      res.status(500).json({ success: false, error: "Failed to clear configuration: " + e.message });
    }
  });
  app.get("/api/system/maintenance", (req, res) => {
    const db = readLocalDb();
    const maintenanceLogs = (db.admin_logs || []).filter((l) => l.module === "SYSTEM" || String(l.action).includes("MAINTENANCE"));
    return res.json({
      success: true,
      maintenance: db.maintenance || {
        enabled: false,
        message: "System is currently undergoing scheduled maintenance. Please check back shortly.",
        setAt: "",
        setBy: ""
      },
      logs: maintenanceLogs
    });
  });
  app.post("/api/system/maintenance", (req, res) => {
    const db = readLocalDb();
    const { enabled, message, setBy } = req.body || {};
    const finalEnabled = !!enabled;
    const finalMessage = message && String(message).trim() || db.maintenance?.message || "System is currently undergoing scheduled maintenance. Please check back shortly.";
    const finalSetBy = setBy || "ADMIN";
    const nowIso = (/* @__PURE__ */ new Date()).toISOString();
    db.maintenance = {
      enabled: finalEnabled,
      message: finalMessage,
      setAt: nowIso,
      setBy: String(finalSetBy)
    };
    db.admin_logs = db.admin_logs || [];
    db.admin_logs.push({
      timestamp: nowIso,
      module: "SYSTEM",
      action: "MAINTENANCE_MODE",
      details: `Application turned ${finalEnabled ? "OFF (Maintenance Active)" : "ON (System Live)"}: ${finalMessage}`,
      admin: String(finalSetBy)
    });
    writeLocalDb(db);
    console.log(`[MAINTENANCE] System availability updated: enabled=${finalEnabled}, by=${finalSetBy}`);
    const maintenanceLogs = db.admin_logs.filter((l) => l.module === "SYSTEM" || String(l.action).includes("MAINTENANCE"));
    return res.json({ success: true, maintenance: db.maintenance, logs: maintenanceLogs });
  });
  app.get("/api/system/online-users", (req, res) => {
    const list = getOnlineUsersList();
    return res.json({
      success: true,
      count: list.length,
      users: list
    });
  });
  app.post("/api/system/presence/logout", (req, res) => {
    const { userCode, username } = req.body || {};
    const code = String(userCode || username || "").trim().toUpperCase();
    if (code) {
      activeUsers.delete(code);
      try {
        const db = readLocalDb();
        if (db.presence) {
          delete db.presence[code];
          import_fs.default.writeFileSync(LOCAL_DB_FILE, JSON.stringify(db, null, 2), "utf8");
        }
      } catch (e) {
      }
    }
    const list = getOnlineUsersList();
    return res.json({ success: true, count: list.length, users: list });
  });
  app.post("/api/system/heartbeat", (req, res) => {
    if (req.body && typeof req.body === "object") {
      registerUserPresence(req.body);
    }
    const db = readLocalDb();
    const list = getOnlineUsersList();
    const maintenanceLogs = (db.admin_logs || []).filter((l) => l.module === "SYSTEM" || String(l.action).includes("MAINTENANCE"));
    return res.json({
      success: true,
      status: "Connected",
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      onlineCount: list.length,
      users: list,
      maintenance: db.maintenance || {
        enabled: false,
        message: "System is currently undergoing scheduled maintenance. Please check back shortly.",
        setAt: "",
        setBy: ""
      },
      logs: maintenanceLogs
    });
  });
  app.post("/api/gas", async (req, res) => {
    try {
      const bodyPayload = { ...req.body };
      const action = bodyPayload.action || "unknown";
      const incomingPresence = bodyPayload.user || bodyPayload.params?.[0]?.user || bodyPayload.params?.[0];
      if (incomingPresence && typeof incomingPresence === "object") {
        registerUserPresence(incomingPresence);
      }
      if (action === "api_ping" || action === "api_heartbeat") {
        const db = readLocalDb();
        return res.json({
          success: true,
          status: "Connected",
          timestamp: (/* @__PURE__ */ new Date()).toISOString(),
          serverTime: (/* @__PURE__ */ new Date()).toISOString(),
          onlineCount: getOnlineUsersList().length,
          users: getOnlineUsersList(),
          maintenance: db.maintenance || {
            enabled: false,
            message: "System is currently undergoing scheduled maintenance. Please check back shortly.",
            setAt: "",
            setBy: ""
          }
        });
      }
      if (action === "api_getOnlineUsers") {
        const list = getOnlineUsersList();
        return res.json({
          success: true,
          count: list.length,
          users: list
        });
      }
      if (action === "api_getMaintenanceStatus") {
        const db = readLocalDb();
        return res.json({
          success: true,
          maintenance: db.maintenance || {
            enabled: false,
            message: "System is currently undergoing scheduled maintenance. Please check back shortly.",
            setAt: "",
            setBy: ""
          }
        });
      }
      if (action === "api_setMaintenanceStatus") {
        const result = executeLocalAction("api_setMaintenanceStatus", bodyPayload.params || []);
        return res.json(result);
      }
      const fsConfig = await getFirestoreConfig();
      let gasUrl = req.headers["x-gas-url"];
      let source = "header";
      if (!gasUrl) {
        try {
          if (import_fs.default.existsSync(CONFIG_FILE)) {
            gasUrl = import_fs.default.readFileSync(CONFIG_FILE, "utf8").trim();
            source = "file";
          }
        } catch (e) {
        }
      }
      if (!gasUrl && fsConfig && fsConfig.gasUrl) {
        gasUrl = fsConfig.gasUrl;
        source = "firestore";
      }
      if (!gasUrl || typeof gasUrl === "string" && gasUrl.includes("REPLACE_WITH_YOUR_EXEC_URL")) {
        gasUrl = process.env.VITE_GAS_URL;
        source = "env";
      }
      if (!gasUrl || typeof gasUrl === "string" && gasUrl.includes("REPLACE_WITH")) {
        gasUrl = HARDCODED_GAS_URL;
        source = "hardcoded";
      }
      const candidateUrls = [];
      if (gasUrl && typeof gasUrl === "string") {
        const trimmed = gasUrl.trim();
        if (trimmed && trimmed.startsWith("https://script.google.com/macros/s/") && !candidateUrls.includes(trimmed)) {
          candidateUrls.push(trimmed);
        }
      }
      if (!candidateUrls.includes(USER_SHEET_URL)) {
        candidateUrls.push(USER_SHEET_URL);
      }
      HARDCODED_GAS_URLS.forEach((url) => {
        if (!candidateUrls.includes(url)) {
          candidateUrls.push(url);
        }
      });
      if (candidateUrls.length === 0) {
        console.error("[PROXY ERROR] GAS URL missing even after fallbacks.");
        return res.status(500).json({
          success: false,
          error: "CONFIGURATION_REQUIRED",
          details: "Google Sheets Connection not configured. Use the setup tool or add VITE_GAS_URL."
        });
      }
      if (!bodyPayload.spreadsheetId) {
        try {
          if (import_fs.default.existsSync(SPREADSHEET_FILE)) {
            bodyPayload.spreadsheetId = import_fs.default.readFileSync(SPREADSHEET_FILE, "utf8").trim();
            console.log(`[API PROXY] Recovered spreadsheetId from local file: ${bodyPayload.spreadsheetId}`);
          }
        } catch (e) {
        }
      }
      if (!bodyPayload.spreadsheetId && fsConfig && fsConfig.spreadsheetId) {
        bodyPayload.spreadsheetId = fsConfig.spreadsheetId;
        console.log(`[API PROXY] Recovered and injected missing spreadsheetId from Firestore: ${fsConfig.spreadsheetId}`);
      }
      if (!bodyPayload.spreadsheetId && process.env.VITE_SPREADSHEET_ID && !process.env.VITE_SPREADSHEET_ID.includes("REPLACE_WITH")) {
        bodyPayload.spreadsheetId = process.env.VITE_SPREADSHEET_ID;
        console.log(`[API PROXY] Recovered and injected spreadsheetId from env: ${bodyPayload.spreadsheetId}`);
      }
      const payloadSize = JSON.stringify(bodyPayload).length;
      console.log(`[API PROXY] Action: ${action} | Size: ${(payloadSize / 1024).toFixed(2)}KB | Pool Size: ${candidateUrls.length} | Source: ${source}`);
      if (action === "api_getInitialData") {
        const localData = executeLocalAction("api_getInitialData", bodyPayload.params || []);
        (async () => {
          const healthyUrls2 = candidateUrls.filter(isUrlHealthy);
          const urlsToTry2 = healthyUrls2.length > 0 ? healthyUrls2 : candidateUrls;
          for (const targetUrl of urlsToTry2) {
            try {
              const bgController = new AbortController();
              const bgTimeout = setTimeout(() => bgController.abort(), 45e3);
              const bgRes = await fetch(targetUrl, {
                method: "POST",
                body: JSON.stringify(bodyPayload),
                headers: { "Content-Type": "application/json" },
                redirect: "follow",
                signal: bgController.signal
              });
              clearTimeout(bgTimeout);
              if (bgRes.ok) {
                const bgText = await bgRes.text();
                if (!bgText.trim().startsWith("<")) {
                  const parsed = JSON.parse(bgText);
                  if (parsed && Array.isArray(parsed.users) && parsed.users.length > 0) {
                    const currentDb = readLocalDb();
                    currentDb.users = parsed.users.map((u) => ({
                      ...u,
                      restrictions: Array.from(new Set((u.restrictions || []).map((code) => {
                        if (code === "B10") return "B9";
                        if (code === "B9") return "B8";
                        if (code === "B8") return "B7";
                        return code;
                      }).filter(Boolean)))
                    }));
                    if (Array.isArray(parsed.workorders) && parsed.workorders.length > 0) {
                      const woMap = /* @__PURE__ */ new Map();
                      (currentDb.workorders || []).forEach((w) => {
                        const k = String(w.id || w.workorderNumber || w.wo);
                        woMap.set(k, w);
                      });
                      parsed.workorders.forEach((w) => {
                        const k = String(w.id || w.workorderNumber || w.wo);
                        woMap.set(k, { ...woMap.get(k), ...w });
                      });
                      currentDb.workorders = Array.from(woMap.values());
                    }
                    if (parsed.settings) currentDb.settings = { ...currentDb.settings || {}, ...parsed.settings };
                    writeLocalDb(currentDb);
                    markUrlHealth(targetUrl, true);
                    break;
                  }
                }
              }
            } catch (err) {
              markUrlHealth(targetUrl, false, err.message);
            }
          }
        })();
        if (localData && Array.isArray(localData.users) && localData.users.length > 0) {
          localData.users = localData.users.map((u) => ({
            ...u,
            restrictions: Array.from(new Set((u.restrictions || []).map((code) => {
              if (code === "B10") return "B9";
              if (code === "B9") return "B8";
              if (code === "B8") return "B7";
              return code;
            }).filter(Boolean)))
          }));
          return res.json(localData);
        }
      }
      const READ_ACTIONS = /* @__PURE__ */ new Set([
        "api_getInitialData",
        "api_getWorkorders",
        "api_getUsers",
        "api_getUserSettings",
        "api_getZoneMappings",
        "api_getMaterialData",
        "api_getCuttingData",
        "api_getInlineData",
        "api_getEndlineData",
        "api_getAQLData",
        "api_getFinalAuditData",
        "api_get8ROUNDSYSTEMData",
        "api_getREPORTS_SOPData",
        "api_getCustomerComplaints",
        "api_getAdminLogs",
        "aggregateZonedData"
      ]);
      const isReadAction = READ_ACTIONS.has(action);
      const cacheKey = isReadAction ? `${action}_${JSON.stringify(bodyPayload.params || [])}_${bodyPayload.spreadsheetId || ""}` : "";
      if (isReadAction) {
        const cached = apiReadCache.get(cacheKey);
        if (cached && Date.now() - cached.timestamp < READ_CACHE_TTL) {
          return res.json(cached.data);
        }
        const forceRemote = bodyPayload.forceRefresh === true;
        if (!forceRemote) {
          try {
            const localData = executeLocalAction(action, bodyPayload.params || []);
            if (localData !== void 0 && localData !== null) {
              if (cacheKey) {
                apiReadCache.set(cacheKey, { timestamp: Date.now(), data: localData });
              }
              (async () => {
                const healthyUrls2 = candidateUrls.filter(isUrlHealthy);
                const urlsToTry2 = healthyUrls2.length > 0 ? healthyUrls2 : candidateUrls;
                for (const targetUrl of urlsToTry2) {
                  try {
                    const bgController = new AbortController();
                    const bgTimeout = setTimeout(() => bgController.abort(), 2e4);
                    const bgRes = await fetch(targetUrl, {
                      method: "POST",
                      body: JSON.stringify(bodyPayload),
                      headers: { "Content-Type": "application/json" },
                      redirect: "follow",
                      signal: bgController.signal
                    });
                    clearTimeout(bgTimeout);
                    if (bgRes.ok) {
                      const bgText = await bgRes.text();
                      if (!bgText.trim().startsWith("<")) {
                        const parsed = JSON.parse(bgText);
                        if (parsed && (parsed.success === true || parsed.success !== false && !parsed.error)) {
                          markUrlHealth(targetUrl, true);
                          if (Array.isArray(parsed) && parsed.length > 0) {
                            const db = readLocalDb();
                            const mergeList = (existing = [], incoming = []) => {
                              const map = /* @__PURE__ */ new Map();
                              (existing || []).forEach((r) => {
                                const k = String(r.id || r.workorderNumber || r.wo || r.grn || JSON.stringify(r));
                                map.set(k, r);
                              });
                              incoming.forEach((r) => {
                                const k = String(r.id || r.workorderNumber || r.wo || r.grn || JSON.stringify(r));
                                map.set(k, { ...map.get(k) || {}, ...r });
                              });
                              return Array.from(map.values());
                            };
                            const hasZoneFilter = Array.isArray(bodyPayload.params) && bodyPayload.params.some((p) => p && typeof p === "object" && p.zone && p.zone !== "ALL");
                            if (action === "api_getWorkorders") db.workorders = hasZoneFilter ? mergeList(db.workorders, parsed) : parsed;
                            else if (action === "api_getMaterialData") db.material_reports = hasZoneFilter ? mergeList(db.material_reports, parsed) : parsed;
                            else if (action === "api_getCuttingData") db.cutting_reports = hasZoneFilter ? mergeList(db.cutting_reports, parsed) : parsed;
                            else if (action === "api_getInlineData" || action === "api_get8ROUNDSYSTEMData") db.sewing_reports = hasZoneFilter ? mergeList(db.sewing_reports, parsed) : parsed;
                            else if (action === "api_getEndlineData") db.endline_reports = hasZoneFilter ? mergeList(db.endline_reports, parsed) : parsed;
                            else if (action === "api_getAQLData") db.aql_reports = hasZoneFilter ? mergeList(db.aql_reports, parsed) : parsed;
                            else if (action === "api_getFinalAuditData") db.final_reports = hasZoneFilter ? mergeList(db.final_reports, parsed) : parsed;
                            else if (action === "api_getREPORTS_SOPData") db.reports_sop = hasZoneFilter ? mergeList(db.reports_sop, parsed) : parsed;
                            else if (action === "api_getCustomerComplaints") db.customer_complaints = hasZoneFilter ? mergeList(db.customer_complaints, parsed) : parsed;
                            else if (action === "api_getZoneMappings") db.zone = parsed;
                            else if (action === "api_getAdminLogs") db.admin_logs = parsed;
                            writeLocalDb(db);
                            if (cacheKey) apiReadCache.delete(cacheKey);
                          } else if (parsed && typeof parsed === "object") {
                            const db = readLocalDb();
                            if (action === "api_getUserSettings" || action === "api_getGlobalSettings") {
                              let targetUser = "GLOBAL";
                              if (Array.isArray(bodyPayload.params) && bodyPayload.params.length > 0) {
                                const p = bodyPayload.params[0];
                                if (typeof p === "string") targetUser = p;
                                else if (p && typeof p === "object") targetUser = p.userCode || p.target || p.sheetName || "GLOBAL";
                              }
                              const settingsObj = parsed.settings && typeof parsed.settings === "object" ? parsed.settings : parsed;
                              db.settings = db.settings || {};
                              db.settings[targetUser] = settingsObj;
                              if (Array.isArray(settingsObj.ITEMS) && settingsObj.ITEMS.length > 0) {
                                db.settings.ITEMS = settingsObj.ITEMS;
                              }
                              if (Array.isArray(settingsObj.SUPPLIER) && settingsObj.SUPPLIER.length > 0) {
                                db.settings.SUPPLIERS = settingsObj.SUPPLIER;
                                db.settings.SUPPLIER = settingsObj.SUPPLIER;
                              } else if (Array.isArray(settingsObj.SUPPLIERS) && settingsObj.SUPPLIERS.length > 0) {
                                db.settings.SUPPLIERS = settingsObj.SUPPLIERS;
                                db.settings.SUPPLIER = settingsObj.SUPPLIERS;
                              }
                              if (targetUser === "GLOBAL" || targetUser === "SETTINGS") {
                                db.settings["GLOBAL"] = settingsObj;
                                db.settings["SETTINGS"] = settingsObj;
                              }
                              if (db.users && targetUser !== "GLOBAL" && targetUser !== "SETTINGS") {
                                const uIdx = db.users.findIndex(
                                  (u) => String(u.userCode || "").trim().toUpperCase() === String(targetUser).trim().toUpperCase() || String(u.username || "").trim().toUpperCase() === String(targetUser).trim().toUpperCase()
                                );
                                if (uIdx !== -1) {
                                  db.users[uIdx].userSettings = settingsObj;
                                }
                              }
                              writeLocalDb(db);
                              if (cacheKey) apiReadCache.delete(cacheKey);
                            } else if (action === "api_getInitialData") {
                              if (Array.isArray(parsed.users) && parsed.users.length > 0) db.users = parsed.users;
                              if (Array.isArray(parsed.workorders) && parsed.workorders.length > 0) db.workorders = parsed.workorders;
                              if (Array.isArray(parsed.zone) && parsed.zone.length > 0) db.zone = parsed.zone;
                              if (parsed.settings && typeof parsed.settings === "object") {
                                db.settings = db.settings || {};
                                db.settings["GLOBAL"] = parsed.settings;
                                db.settings["SETTINGS"] = parsed.settings;
                                if (Array.isArray(parsed.settings.ITEMS) && parsed.settings.ITEMS.length > 0) {
                                  db.settings.ITEMS = parsed.settings.ITEMS;
                                }
                                if (Array.isArray(parsed.settings.SUPPLIER) && parsed.settings.SUPPLIER.length > 0) {
                                  db.settings.SUPPLIERS = parsed.settings.SUPPLIER;
                                  db.settings.SUPPLIER = parsed.settings.SUPPLIER;
                                } else if (Array.isArray(parsed.settings.SUPPLIERS) && parsed.settings.SUPPLIERS.length > 0) {
                                  db.settings.SUPPLIERS = parsed.settings.SUPPLIERS;
                                  db.settings.SUPPLIER = parsed.settings.SUPPLIERS;
                                }
                              }
                              writeLocalDb(db);
                              if (cacheKey) apiReadCache.delete(cacheKey);
                            }
                          }
                          break;
                        }
                      }
                    }
                  } catch (e) {
                  }
                }
              })();
              return res.json(localData);
            }
          } catch (localErr) {
            console.warn(`[LOCAL DB READ] Fast-path notice for ${action}:`, localErr.message);
          }
        }
      } else {
        clearApiReadCache();
      }
      let localWriteResult = null;
      if (!isReadAction) {
        try {
          localWriteResult = executeLocalAction(action, bodyPayload.params || []);
        } catch (e) {
          console.warn(`[LOCAL WRITE] Immediate write execution notice for ${action}:`, e.message);
        }
      }
      if (["api_uploadSOPFile", "api_uploadComplaintImage", "api_saveREPORTS_SOP", "api_deleteREPORTS_SOP", "api_getREPORTS_SOPData", "api_getCustomerComplaints", "api_saveCustomerComplaint", "api_deleteCustomerComplaint", "api_clearCustomerComplaints", "api_clearAllCustomerComplaints"].includes(action)) {
        console.log(`[API PROXY] Routing action "${action}" with cloud and local fallback...`);
        const isUpload = action === "api_uploadSOPFile" || action === "api_uploadComplaintImage";
        const isSopRead = action === "api_getREPORTS_SOPData" || action === "api_getCustomerComplaints";
        if (!isUpload && !isSopRead) {
          try {
            executeLocalAction(action, bodyPayload.params || []);
          } catch (e) {
          }
          (async () => {
            const sopUrls = candidateUrls.filter(isUrlHealthy);
            const urlsToTry3 = sopUrls.length > 0 ? sopUrls : candidateUrls;
            for (const bgUrl of urlsToTry3) {
              try {
                const bgController = new AbortController();
                const bgTimeout = setTimeout(() => bgController.abort(), 45e3);
                const bgRes = await fetch(bgUrl, {
                  method: "POST",
                  body: JSON.stringify(bodyPayload),
                  headers: { "Content-Type": "application/json" },
                  redirect: "follow",
                  signal: bgController.signal
                });
                clearTimeout(bgTimeout);
                if (bgRes.ok) {
                  const bgText = await bgRes.text();
                  if (!bgText.trim().startsWith("<")) {
                    markUrlHealth(bgUrl, true);
                    break;
                  }
                }
              } catch (bgErr) {
              }
            }
          })();
          return res.json({ success: true, id: bodyPayload.params?.[0]?.id || `loc-${Date.now()}` });
        }
        let appsScriptSuccess = false;
        let appsScriptResult = null;
        let sopCandidateUrls = [];
        if (action === "api_uploadSOPFile" || action === "api_uploadComplaintImage") {
          sopCandidateUrls.push(USER_DRIVE_URL);
          let driveUrl = null;
          try {
            if (import_fs.default.existsSync(CONFIG_DRIVE_FILE)) {
              driveUrl = import_fs.default.readFileSync(CONFIG_DRIVE_FILE, "utf8").trim();
            }
          } catch (e) {
          }
          if (!driveUrl && fsConfig && fsConfig.gasDriveUrl) {
            driveUrl = fsConfig.gasDriveUrl;
          }
          if (driveUrl && !sopCandidateUrls.includes(driveUrl)) {
            sopCandidateUrls.push(driveUrl);
          }
        } else {
          sopCandidateUrls = [...candidateUrls];
        }
        const healthySopUrls = sopCandidateUrls.filter(isUrlHealthy);
        const urlsToTry2 = healthySopUrls.length > 0 ? healthySopUrls : sopCandidateUrls;
        for (const targetUrl of urlsToTry2) {
          try {
            const controller = new AbortController();
            const timeoutDuration = isUpload ? 6e4 : 8e3;
            const timeoutId = setTimeout(() => controller.abort(), timeoutDuration);
            const response = await fetch(targetUrl, {
              method: "POST",
              body: JSON.stringify(bodyPayload),
              headers: { "Content-Type": "application/json" },
              redirect: "follow",
              signal: controller.signal
            });
            clearTimeout(timeoutId);
            const text = await response.text();
            if (text.trim().startsWith("<") || text.includes("Page not found") || text.includes("Sorry, unable to open")) {
              markUrlHealth(targetUrl, false, "HTML 404 response");
              continue;
            }
            if (response.ok) {
              try {
                const result = JSON.parse(text);
                if (result && (result.success === true || result.success !== false && !result.error)) {
                  console.log(`[API PROXY] Action "${action}" successfully executed on Apps Script!`);
                  markUrlHealth(targetUrl, true);
                  appsScriptSuccess = true;
                  appsScriptResult = result;
                  break;
                }
              } catch (pe) {
                markUrlHealth(targetUrl, false, "Invalid JSON");
              }
            }
          } catch (err) {
            markUrlHealth(targetUrl, false, err.message);
          }
        }
        if (appsScriptSuccess && appsScriptResult) {
          if (action === "api_getREPORTS_SOPData") {
            const db = readLocalDb();
            const deletedList = db.deleted_sop_ids || [];
            let cleanResult = Array.isArray(appsScriptResult) ? appsScriptResult.filter((r) => r && r.id !== "__DELETED_SOP_IDS__") : [];
            if (cleanResult.length === 0 && Array.isArray(db.reports_sop) && db.reports_sop.length > 0) {
              cleanResult = [...db.reports_sop];
            }
            const seenIds = /* @__PURE__ */ new Set();
            const seenDriveIds = /* @__PURE__ */ new Set();
            const seenSignatures = /* @__PURE__ */ new Set();
            const deduped = [];
            for (const item of cleanResult) {
              if (!item || typeof item !== "object") continue;
              const id = item.id ? String(item.id).trim().toLowerCase() : "";
              const driveId = item.driveFileId ? String(item.driveFileId).trim().toLowerCase() : "";
              const title = item.title ? String(item.title).trim().toLowerCase() : "";
              const attach = (item.attachmentUrl || item.attachmentName || "").trim().toLowerCase();
              const sig = `${title}:::${attach}`;
              if (id && seenIds.has(id)) continue;
              if (driveId && seenDriveIds.has(driveId)) continue;
              if (title && attach && seenSignatures.has(sig)) continue;
              if (id) seenIds.add(id);
              if (driveId) seenDriveIds.add(driveId);
              if (title && attach) seenSignatures.add(sig);
              deduped.push(item);
            }
            deduped.push({ id: "__DELETED_SOP_IDS__", deletedList });
            return res.json(deduped);
          }
          return res.json(appsScriptResult);
        }
        try {
          const localResult = localWriteResult !== null ? localWriteResult : executeLocalAction(action, bodyPayload.params || []);
          if (localResult !== void 0) {
            return res.json(localResult);
          }
        } catch (localErr) {
          return res.status(500).json({ success: false, error: localErr.message });
        }
      }
      if (!isReadAction) {
        const healthyUrls2 = candidateUrls.filter(isUrlHealthy);
        const urlsToTry2 = healthyUrls2.length > 0 ? healthyUrls2 : candidateUrls;
        (async () => {
          for (const targetUrl of urlsToTry2) {
            try {
              const bgController = new AbortController();
              const bgTimeout = setTimeout(() => bgController.abort(), 45e3);
              const bgRes = await fetch(targetUrl, {
                method: "POST",
                body: JSON.stringify(bodyPayload),
                headers: { "Content-Type": "application/json" },
                redirect: "follow",
                signal: bgController.signal
              });
              clearTimeout(bgTimeout);
              if (bgRes.ok) {
                const bgText = await bgRes.text();
                if (!bgText.trim().startsWith("<")) {
                  console.log(`[SHEET SYNC SUCCESS] Action "${action}" successfully synchronized to Google Sheet:`, bgText.substring(0, 100));
                  markUrlHealth(targetUrl, true);
                  break;
                }
              } else {
                console.warn(`[SHEET SYNC] Action "${action}" received HTTP ${bgRes.status} from Google Sheets:`, targetUrl);
              }
            } catch (bgErr) {
              console.warn(`[SHEET SYNC ERROR] Action "${action}" failed on ${targetUrl}:`, bgErr.message);
              markUrlHealth(targetUrl, false, bgErr.message);
            }
          }
        })();
        if (localWriteResult !== null && localWriteResult !== void 0) {
          return res.json({ success: true, ...localWriteResult });
        }
        return res.json({ success: true });
      }
      const healthyUrls = candidateUrls.filter(isUrlHealthy);
      const urlsToTry = healthyUrls.length > 0 ? healthyUrls : candidateUrls;
      let responseData = null;
      let success = false;
      for (const targetUrl of urlsToTry) {
        try {
          const controller = new AbortController();
          const timeoutDuration = 25e3;
          const timeoutId = setTimeout(() => controller.abort(), timeoutDuration);
          const response = await fetch(targetUrl, {
            method: "POST",
            body: JSON.stringify(bodyPayload),
            headers: { "Content-Type": "application/json" },
            redirect: "follow",
            signal: controller.signal
          });
          clearTimeout(timeoutId);
          const text = await response.text();
          if (text.trim().startsWith("<") || text.includes("Page not found") || text.includes("Sorry, unable to open")) {
            markUrlHealth(targetUrl, false, "HTML 404 response");
            continue;
          }
          if (response.ok) {
            try {
              const parsed = JSON.parse(text);
              if (parsed && (parsed.success === true || parsed.success !== false && !parsed.error)) {
                responseData = parsed;
                success = true;
                markUrlHealth(targetUrl, true);
                break;
              } else {
                markUrlHealth(targetUrl, false, parsed?.error || "success=false");
              }
            } catch (pErr) {
              markUrlHealth(targetUrl, false, "Non-JSON response");
            }
          } else {
            markUrlHealth(targetUrl, false, `HTTP ${response.status}`);
          }
        } catch (fetchErr) {
          markUrlHealth(targetUrl, false, fetchErr.message);
        }
      }
      if (success && responseData) {
        if (isReadAction && cacheKey) {
          apiReadCache.set(cacheKey, { timestamp: Date.now(), data: responseData });
        }
        return res.json(responseData);
      }
      try {
        const localResult = executeLocalAction(action, bodyPayload.params || []);
        if (localResult !== void 0) {
          if (isReadAction && cacheKey) {
            apiReadCache.set(cacheKey, { timestamp: Date.now(), data: localResult });
          }
          return res.json(localResult);
        }
      } catch (localErr) {
        console.error(`[API PROXY Fallback] Local database error for ${action}:`, localErr.message);
      }
      if (isReadAction) {
        if (action === "api_getInitialData") {
          return res.json(executeLocalAction("api_getInitialData", bodyPayload.params || []));
        }
        return res.json([]);
      } else {
        return res.json({ success: true });
      }
    } catch (error) {
      console.error("[API PROXY] Request Execution Failed:", error.message);
      res.status(500).json({
        success: false,
        error: error.name === "AbortError" ? "Request Timed Out (GAS limit)" : "Failed to communicate with Google Sheets.",
        details: error.message
      });
    }
  });
  async function dynamicGetZoneMappings(gasUrl, spreadsheetId) {
    const payload = {
      action: "api_getDataBySheet",
      params: ["ZONE"],
      spreadsheetId
    };
    const response = await fetch(gasUrl, {
      method: "POST",
      body: JSON.stringify(payload),
      headers: { "Content-Type": "application/json" }
    });
    if (!response.ok) {
      throw new Error(`Failed to fetch ZONE sheet: HTTP ${response.status}`);
    }
    const text = await response.text();
    const parsed = JSON.parse(text);
    if (parsed && parsed.success === false) {
      throw new Error(parsed.error || "Remote GAS returned success=false");
    }
    const zoneRows = Array.isArray(parsed) ? parsed : parsed && parsed.success !== false ? parsed.data || [] : [];
    const result = [];
    const zoneIdToNameMap = /* @__PURE__ */ new Map();
    for (const row of zoneRows) {
      const z = String(row.zone || "").trim().toUpperCase();
      const id = String(row.id || "").trim().toUpperCase();
      if (z.startsWith("ZMAP-") && id && !id.startsWith("ZMAP-")) {
        zoneIdToNameMap.set(z, id);
      } else if (id.startsWith("ZMAP-") && z && !z.startsWith("ZMAP-")) {
        zoneIdToNameMap.set(id, z);
      }
    }
    const uniqueUnits = Array.from(new Set(
      zoneRows.map((row) => String(row.unit || "").trim().toUpperCase()).filter(Boolean)
    ));
    const unitWorkersMap = /* @__PURE__ */ new Map();
    await Promise.all(uniqueUnits.map(async (unitName) => {
      try {
        const uPayload = {
          action: "api_getDataBySheet",
          params: [unitName],
          spreadsheetId
        };
        const uResponse = await fetch(gasUrl, {
          method: "POST",
          body: JSON.stringify(uPayload),
          headers: { "Content-Type": "application/json" }
        });
        if (uResponse.ok) {
          const uText = await uResponse.text();
          const uParsed = JSON.parse(uText);
          const rows = Array.isArray(uParsed) ? uParsed : uParsed && uParsed.success !== false ? uParsed.data || [] : [];
          unitWorkersMap.set(unitName, rows);
        }
      } catch (err) {
        console.warn(`[DYNAMIC PROXY] Failed to fetch unit sheet ${unitName}:`, err.message);
      }
    }));
    for (const row of zoneRows) {
      const unitName = String(row.unit || "").trim().toUpperCase();
      let zoneName = String(row.zone || "").trim().toUpperCase();
      let idValue = String(row.id || "").trim();
      if (zoneName.startsWith("ZMAP-")) {
        const mapped = zoneIdToNameMap.get(zoneName);
        if (mapped) {
          zoneName = mapped;
        }
      }
      if (!zoneName || zoneName.startsWith("ZMAP-")) continue;
      if (unitName) {
        const workerRows = unitWorkersMap.get(unitName);
        if (workerRows && workerRows.length > 0) {
          let hasWorker = false;
          for (const wRow of workerRows) {
            const workerName = String(wRow.worker || "").trim().toUpperCase();
            if (!workerName) continue;
            hasWorker = true;
            const wId = wRow.id || "zmap-" + Math.floor(Math.random() * 1e7);
            result.push({
              id: wId,
              zone: zoneName,
              unit: unitName,
              worker: workerName,
              timestamp: wRow.timestamp || (/* @__PURE__ */ new Date()).toISOString()
            });
          }
          if (!hasWorker) {
            result.push({
              id: idValue || row.id || "zmap-" + Math.floor(Math.random() * 1e7),
              zone: zoneName,
              unit: unitName,
              worker: "",
              timestamp: row.timestamp || (/* @__PURE__ */ new Date()).toISOString()
            });
          }
        } else {
          result.push({
            id: idValue || row.id || "zmap-" + Math.floor(Math.random() * 1e7),
            zone: zoneName,
            unit: unitName,
            worker: "",
            timestamp: row.timestamp || (/* @__PURE__ */ new Date()).toISOString()
          });
        }
      } else {
        result.push({
          id: idValue || row.id || "zmap-" + Math.floor(Math.random() * 1e7),
          zone: zoneName,
          unit: "",
          worker: "",
          timestamp: row.timestamp || (/* @__PURE__ */ new Date()).toISOString()
        });
      }
    }
    return result;
  }
  async function dynamicSaveZoneMapping(gasUrl, spreadsheetId, record) {
    if (!record.id) {
      record.id = "zmap-" + Math.floor(Math.random() * 1e7);
    }
    if (!record.timestamp) {
      record.timestamp = (/* @__PURE__ */ new Date()).toISOString();
    }
    const zone = String(record.zone || "").trim().toUpperCase();
    const unit = String(record.unit || "").trim().toUpperCase();
    const worker = String(record.worker || "").trim().toUpperCase();
    if (worker) {
      if (!unit) {
        return { success: false, error: "Unit is required to save a worker." };
      }
      const payload = {
        action: "api_saveDataBySheet",
        params: [unit, { id: record.id, worker, timestamp: record.timestamp }],
        spreadsheetId
      };
      const response = await fetch(gasUrl, {
        method: "POST",
        body: JSON.stringify(payload),
        headers: { "Content-Type": "application/json" }
      });
      const parsed = await response.json();
      return parsed;
    }
    if (unit) {
      if (!zone) {
        return { success: false, error: "Zone is required to save a unit." };
      }
      const payload = {
        action: "api_saveDataBySheet",
        params: ["ZONE", { id: record.id, zone, unit, timestamp: record.timestamp }],
        spreadsheetId
      };
      const response = await fetch(gasUrl, {
        method: "POST",
        body: JSON.stringify(payload),
        headers: { "Content-Type": "application/json" }
      });
      const parsed = await response.json();
      return parsed;
    }
    if (zone) {
      const payload = {
        action: "api_saveDataBySheet",
        params: ["ZONE", { id: record.id, zone, unit: "", timestamp: record.timestamp }],
        spreadsheetId
      };
      const response = await fetch(gasUrl, {
        method: "POST",
        body: JSON.stringify(payload),
        headers: { "Content-Type": "application/json" }
      });
      const parsed = await response.json();
      return parsed;
    }
    return { success: false, error: "Invalid record format" };
  }
  async function dynamicDeleteZoneMapping(gasUrl, spreadsheetId, param) {
    let targetIdStr = "";
    let targetZone = "";
    let targetUnit = "";
    let targetWorker = "";
    if (param && typeof param === "object") {
      targetIdStr = String(param.id || "").trim();
      targetZone = String(param.zone || "").trim().toUpperCase();
      targetUnit = String(param.unit || "").trim().toUpperCase();
      targetWorker = String(param.worker || "").trim().toUpperCase();
    } else {
      targetIdStr = String(param || "").trim();
    }
    if (targetWorker && targetUnit) {
      const payload = {
        action: "api_deleteDataBySheet",
        params: [targetUnit, targetIdStr],
        spreadsheetId
      };
      const response = await fetch(gasUrl, {
        method: "POST",
        body: JSON.stringify(payload),
        headers: { "Content-Type": "application/json" }
      });
      return await response.json();
    }
    if (targetUnit && !targetWorker) {
      const payload = {
        action: "api_deleteDataBySheet",
        params: ["ZONE", targetIdStr],
        spreadsheetId
      };
      const response = await fetch(gasUrl, {
        method: "POST",
        body: JSON.stringify(payload),
        headers: { "Content-Type": "application/json" }
      });
      return await response.json();
    }
    if (targetZone && !targetUnit && !targetWorker) {
      const getPayload = {
        action: "api_getDataBySheet",
        params: ["ZONE"],
        spreadsheetId
      };
      const response = await fetch(gasUrl, {
        method: "POST",
        body: JSON.stringify(getPayload),
        headers: { "Content-Type": "application/json" }
      });
      if (response.ok) {
        const parsed = await response.json();
        const zoneRows = Array.isArray(parsed) ? parsed : parsed && parsed.success !== false ? parsed.data || [] : [];
        const toDelete = zoneRows.filter((r) => {
          if (targetIdStr && String(r.id || "").trim() === targetIdStr) return true;
          if (String(r.zone || "").trim().toUpperCase() === targetZone) return true;
          return false;
        });
        for (const row of toDelete) {
          if (row.id) {
            await fetch(gasUrl, {
              method: "POST",
              body: JSON.stringify({
                action: "api_deleteDataBySheet",
                params: ["ZONE", row.id],
                spreadsheetId
              }),
              headers: { "Content-Type": "application/json" }
            });
          }
        }
        return { success: true };
      }
    }
    if (targetIdStr) {
      const payload = {
        action: "api_deleteDataBySheet",
        params: ["ZONE", targetIdStr],
        spreadsheetId
      };
      const response = await fetch(gasUrl, {
        method: "POST",
        body: JSON.stringify(payload),
        headers: { "Content-Type": "application/json" }
      });
      return await response.json();
    }
    return { success: false, error: "Invalid record format" };
  }
  app.post("/api/blossom-analyse", async (req, res) => {
    try {
      let extractJSON = function(text) {
        try {
          return JSON.parse(text);
        } catch (e) {
          const startIdx = text.indexOf("{");
          const endIdx = text.lastIndexOf("}");
          if (startIdx !== -1 && endIdx !== -1 && endIdx > startIdx) {
            const candidate = text.substring(startIdx, endIdx + 1);
            try {
              return JSON.parse(candidate);
            } catch (innerErr) {
              const cleaned = candidate.replace(/[\u0000-\u001F\u007F-\u009F]/g, "").trim();
              return JSON.parse(cleaned);
            }
          }
          throw e;
        }
      };
      const {
        materialData = [],
        cuttingData = [],
        inlineData = [],
        endlineData = [],
        aqlData = [],
        finalAuditData = [],
        usersData = [],
        workordersData = [],
        sopData = [],
        customerComplaintData = [],
        // Submodule alias mappings
        b1_material = [],
        b2_cutting = [],
        b3_inline = [],
        b4_endline = [],
        b5_aql = [],
        b6_finalAudit = [],
        b7_users = [],
        b8_workorders = [],
        b9_sop = [],
        b10_customerComplaints = [],
        users = [],
        workorders = [],
        customerComplaints = [],
        zone = "ALL"
      } = req.body;
      const b1 = (b1_material.length > 0 ? b1_material : materialData) || [];
      const b2 = (b2_cutting.length > 0 ? b2_cutting : cuttingData) || [];
      const b3 = (b3_inline.length > 0 ? b3_inline : inlineData) || [];
      const b4 = (b4_endline.length > 0 ? b4_endline : endlineData) || [];
      const b5 = (b5_aql.length > 0 ? b5_aql : aqlData) || [];
      const b6 = (b6_finalAudit.length > 0 ? b6_finalAudit : finalAuditData) || [];
      const b7 = (b7_users.length > 0 ? b7_users : usersData.length > 0 ? usersData : users) || [];
      const b8 = (b8_workorders.length > 0 ? b8_workorders : workordersData.length > 0 ? workordersData : workorders) || [];
      const b9 = (b9_sop.length > 0 ? b9_sop : sopData) || [];
      const b10 = (b10_customerComplaints.length > 0 ? b10_customerComplaints : customerComplaintData.length > 0 ? customerComplaintData : customerComplaints) || [];
      let b1Checked = 0, b1Defects = 0;
      b1.forEach((log) => {
        b1Checked += Number(log.checkedQuantity || log.rollLength || log.quantity || 100);
        if (Array.isArray(log.items)) {
          log.items.forEach((it) => b1Defects += Number(it.rejectedQuantity || it.failQty || 0));
        } else {
          b1Defects += Number(log.rejectedQuantity || log.failQty || 0);
        }
      });
      const b1Rate = b1Checked > 0 ? (b1Defects / b1Checked * 100).toFixed(2) + "% Defect" : "0% Defect";
      const b1Score = Math.max(60, Math.min(99, Math.round(98 - b1Defects / (b1Checked || 1) * 120)));
      const b1Status = b1Score >= 90 ? "OPTIMAL" : b1Score >= 75 ? "STABLE" : b1Score >= 60 ? "WARNING" : "CRITICAL";
      let b2Checked = 0, b2Defects = 0;
      b2.forEach((log) => {
        b2Checked += Number(log.totalPcsCut || log.tableCheckedQty || log.checkedQty || 100);
        b2Defects += Number(log.reworkQty || 0) + Number(log.rejectedQty || 0) + Number(log.failQty || 0);
      });
      const b2Rate = b2Checked > 0 ? (b2Defects / b2Checked * 100).toFixed(2) + "% Reject/Rework" : "0% Defect";
      const b2Score = Math.max(60, Math.min(99, Math.round(97 - b2Defects / (b2Checked || 1) * 150)));
      const b2Status = b2Score >= 90 ? "OPTIMAL" : b2Score >= 75 ? "STABLE" : b2Score >= 60 ? "WARNING" : "CRITICAL";
      let b3Checked = 0, b3Defects = 0;
      b3.forEach((log) => {
        b3Checked += Number(log.pcsChecked || log.checkedQty || 50);
        b3Defects += Number(log.complaintPcs || log.failQty || 0);
      });
      const b3Rate = b3Checked > 0 ? (b3Defects / b3Checked * 100).toFixed(2) + "% Deviation" : "0% Deviation";
      const b3Score = Math.max(55, Math.min(99, Math.round(96 - b3Defects / (b3Checked || 1) * 130)));
      const b3Status = b3Score >= 90 ? "OPTIMAL" : b3Score >= 75 ? "STABLE" : b3Score >= 60 ? "WARNING" : "CRITICAL";
      let b4Checked = 0, b4Defects = 0;
      b4.forEach((log) => {
        b4Checked += Number(log.checkedQty || log.pcsChecked || 80);
        b4Defects += Number(log.reworkQty || 0) + Number(log.failQty || 0) + Number(log.rework || 0);
      });
      const b4Rate = b4Checked > 0 ? ((1 - b4Defects / (b4Checked || 1)) * 100).toFixed(1) + "% FTT" : "100% FTT";
      const b4Score = Math.max(50, Math.min(99, Math.round(95 - b4Defects / (b4Checked || 1) * 100)));
      const b4Status = b4Score >= 90 ? "OPTIMAL" : b4Score >= 75 ? "STABLE" : b4Score >= 60 ? "WARNING" : "CRITICAL";
      let b5Lots = b5.length, b5Fails = 0, b5DefectPcs = 0;
      b5.forEach((log) => {
        b5DefectPcs += Number(log.failedPieces || log.failedPcs || log.failQty || 0);
        const st = String(log.status || log.auditStatus || "").toUpperCase();
        if (st === "FAIL") b5Fails++;
      });
      const b5Rate = b5Lots > 0 ? ((b5Lots - b5Fails) / b5Lots * 100).toFixed(1) + "% Pass" : "100% Pass";
      const b5Score = Math.max(50, Math.min(99, Math.round(98 - b5Fails * 12)));
      const b5Status = b5Fails > 0 ? b5Fails > 2 ? "CRITICAL" : "WARNING" : b5Lots > 0 ? "OPTIMAL" : "STABLE";
      let b6Audits = b6.length, b6Rejects = 0;
      b6.forEach((log) => {
        b6Rejects += Number(log.rejected || log.rejectedQty || log.failQty || 0);
      });
      const b6Rate = b6Audits > 0 ? ((b6Audits - (b6Rejects > 0 ? 1 : 0)) / b6Audits * 100).toFixed(1) + "% Acceptance" : "100% Release";
      const b6Score = Math.max(55, Math.min(99, Math.round(97 - b6Rejects * 8)));
      const b6Status = b6Rejects > 0 ? "WARNING" : "OPTIMAL";
      const b8Total = b8.length;
      const b8Active = b8.filter((w) => !w.status || String(w.status).toUpperCase() !== "CLOSED").length;
      let b8TotalQty = 0;
      b8.forEach((w) => b8TotalQty += Number(w.orderQty || w.quantity || 0));
      const b8Score = b8Total > 0 ? 94 : 85;
      const b8Status = b8Active > 0 ? "OPTIMAL" : "STABLE";
      const b9Total = b9.length;
      const b9Score = b9Total >= 3 ? 98 : b9Total > 0 ? 90 : 78;
      const b9Status = b9Total > 0 ? "OPTIMAL" : "WARNING";
      const b10Total = b10.length;
      let b10Pieces = 0;
      b10.forEach((c) => b10Pieces += Number(c.pcsCount || c.pcs || 1));
      const b10Score = b10Total === 0 ? 98 : Math.max(45, 95 - b10Total * 10 - Math.min(25, b10Pieces * 2));
      const b10Status = b10Total === 0 ? "OPTIMAL" : b10Total > 2 ? "CRITICAL" : "WARNING";
      const overallScore = Math.round(
        b1Score * 0.1 + b2Score * 0.1 + b3Score * 0.15 + b4Score * 0.15 + b5Score * 0.15 + b6Score * 0.1 + b8Score * 0.1 + b9Score * 0.05 + b10Score * 0.1
      );
      const qualityVerdict = overallScore >= 90 ? "OPTIMAL MANUFACTURING QUALITY" : overallScore >= 75 ? "STABLE - CONTROLLED REWORK LEVEL" : overallScore >= 60 ? "DRIFT WARNING - PROCESS INTERVENTION REQUIRED" : "CRITICAL ALERT - MULTI-MODULE STOPPAGE RISK";
      const getFallbackProposal = () => {
        return {
          aiGenerated: false,
          score: overallScore,
          overallScore,
          qualityVerdict,
          summary: `Blossom AI completed industrial diagnostic auditing across all 9 operational modules (B1 through B9) for ${zone === "ALL" ? "Global Production" : `Zone ${zone}`}. Total quality records tracked: ${b1.length + b2.length + b3.length + b4.length + b5.length + b6.length + b8.length + b9.length + b10.length}. Active quality health profile indexes at ${overallScore}/100 with ${b5Fails > 0 ? `${b5Fails} AQL lot failures` : "stable AQL batching"} and ${b10Total > 0 ? `${b10Total} registered customer complaints (${b10Pieces} pcs)` : "zero customer returns"}.`,
          moduleBreakdown: [
            {
              moduleId: "B1",
              name: "Material Report",
              status: b1Status,
              score: b1Score,
              totalRecords: b1.length,
              defectCount: b1Defects,
              rate: b1Rate,
              keyFindings: b1.length > 0 ? `Evaluated ${b1.length} material logs with ${b1Defects} rejected fabric/trim units.` : "Standard fabric intake logging active; shrinkage and elasticity within baseline.",
              actionRequired: b1Defects > 0 ? "Execute 4-point fabric inspection and request supplier shade delta verification." : "Maintain routine roll-by-roll elastane tension testing."
            },
            {
              moduleId: "B2",
              name: "Cutting Report",
              status: b2Status,
              score: b2Score,
              totalRecords: b2.length,
              defectCount: b2Defects,
              rate: b2Rate,
              keyFindings: b2.length > 0 ? `Registered ${b2.length} cutting audits. ${b2Defects} panels rejected or marked for recut.` : "Cutting table accuracy consistent; marker efficiency running at target.",
              actionRequired: b2Defects > 0 ? "Re-align laser cutters and check rotary blade sharpness to avoid jagged fraying." : "Routine pattern notch alignment verification on daily changeovers."
            },
            {
              moduleId: "B3",
              name: "Inline Report",
              status: b3Status,
              score: b3Score,
              totalRecords: b3.length,
              defectCount: b3Defects,
              rate: b3Rate,
              keyFindings: `Hourly inline audits registered ${b3.length} inspection rounds with ${b3Defects} defective stitch pieces detected early.`,
              actionRequired: b3Defects > 0 ? "Focus technician attention on needle thread tensions and feed-dog calibration." : "Preserve 8-round hourly inspection frequency across all active sewing lines."
            },
            {
              moduleId: "B4",
              name: "Endline Report",
              status: b4Status,
              score: b4Score,
              totalRecords: b4.length,
              defectCount: b4Defects,
              rate: b4Rate,
              keyFindings: `100% endline checkpoints processed ${b4.length} batches; recorded ${b4Defects} rework items.`,
              actionRequired: b4Defects > 0 ? "Isolate recurring operator defects (e.g. cup attachment slip) for station-side retraining." : "Maintain 100% final garment check prior to transfer to finishing."
            },
            {
              moduleId: "B5",
              name: "AQL Report",
              status: b5Status,
              score: b5Score,
              totalRecords: b5Lots,
              defectCount: b5DefectPcs,
              rate: b5Rate,
              keyFindings: b5Lots > 0 ? `${b5Lots} random sampling lots audited; ${b5Fails} lots failed standard acceptance sampling.` : "AQL batch gatekeeping operating on standard sampling schedules.",
              actionRequired: b5Fails > 0 ? "Initiate 100% quarantine sorting on failed lots prior to packaging release." : "Preserve AQL 2.5 major / 4.0 minor inspection parameters."
            },
            {
              moduleId: "B6",
              name: "Final Audit Report",
              status: b6Status,
              score: b6Score,
              totalRecords: b6Audits,
              defectCount: b6Rejects,
              rate: b6Rate,
              keyFindings: `Pre-shipment audit logs track ${b6Audits} releases with ${b6Rejects} carton/packaging infractions.`,
              actionRequired: b6Rejects > 0 ? "Cross-verify carton barcode label barcodes and polybag hanger tags." : "Continue standard pre-dispatch carton drop and seal testing."
            },
            {
              moduleId: "B7",
              name: "Workorder Data",
              status: b8Status,
              score: b8Score,
              totalRecords: b8Total,
              defectCount: 0,
              rate: `${b8Active} Active Batches`,
              keyFindings: `Tracking ${b8Total} workorders across factory lines; ${b8Active} active lots represent ${b8TotalQty.toLocaleString()} planned garments.`,
              actionRequired: "Sync production milestone completion with physical QC tally to eliminate inventory drift."
            },
            {
              moduleId: "B8",
              name: "SOP & Audit Documents",
              status: b9Status,
              score: b9Score,
              totalRecords: b9Total,
              defectCount: 0,
              rate: `${b9Total} Active SOPs`,
              keyFindings: `${b9Total} validated quality procedures and compliance audit protocols on file.`,
              actionRequired: b9Total === 0 ? "Upload foundational bra & panty sewing SOPs and buyer compliance criteria." : "Verify annual revision cycles on technical construction sheets."
            },
            {
              moduleId: "B9",
              name: "Customer Complaint Report",
              status: b10Status,
              score: b10Score,
              totalRecords: b10Total,
              defectCount: b10Pieces,
              rate: b10Total > 0 ? `${b10Pieces} Affected Pcs` : "Zero Complaints",
              keyFindings: b10Total > 0 ? `Registered ${b10Total} external buyer complaints involving ${b10Pieces} garments.` : "Flawless external quality record: zero post-market client complaints.",
              actionRequired: b10Total > 0 ? "Execute formal 8D CAPA report and implement poke-yoke fixture on reported seam." : "Maintain customer feedback monitoring loop."
            }
          ],
          recommendations: [
            {
              title: "Cross-Module Inline & Endline Needle Tension Calibration",
              priority: b3Defects > 5 || b4Defects > 10 ? "HIGH" : "MEDIUM",
              description: "Coordinate B3 (Inline) hourly findings with B4 (Endline) reject records. Fine-tune double-needle lockstitch tension to eliminate recurring skipped stitches and seam grins."
            },
            {
              title: "AQL Batch Quarantine & 100% Sorting Gate",
              priority: b5Fails > 0 ? "HIGH" : "LOW",
              description: b5Fails > 0 ? `B5 reports record ${b5Fails} failed lots. Do not release lots to packaging without signed QA manager approval.` : "Maintain standard AQL 2.5 random audit verification on finished workorders."
            },
            {
              title: "Customer Complaint CAPA Implementation (B10)",
              priority: b10Total > 0 ? "HIGH" : "LOW",
              description: b10Total > 0 ? `Address root causes for registered customer complaints immediately. Update B9 SOP documentation to prevent recurrence.` : "Maintain proactive packaging and labeling checks in B6 Final Audit."
            },
            {
              title: "Material Receiving Verification & Supplier Quality (B1)",
              priority: b1Defects > 0 ? "MEDIUM" : "LOW",
              description: "Enforce pre-production 4-point inspection on all incoming elastane roll goods to detect stretch variation before spreading in B2 Cutting."
            }
          ],
          identifiedProblems: [
            {
              Area: "B3/B4 Sewing Lines",
              issue: b3Defects > 0 ? "Stitching tension and thread breakage deviations" : "Minor seam alignment variance",
              Module: "B3 - Inline Quality",
              impact: "Downstream rework burden at 100% endline inspection checkpoint",
              status: b3Defects > 10 ? "Critical" : "Warning"
            },
            {
              Area: "B5 AQL Audit Gate",
              issue: b5Fails > 0 ? `${b5Fails} sampling lot(s) exceeded rejectable quality limit` : "Sample lot size tracking",
              Module: "B5 - AQL Inspection",
              impact: "Potential delivery delay if 100% sorting is enforced",
              status: b5Fails > 0 ? "Critical" : "Open"
            },
            {
              Area: "B10 Customer Satisfaction",
              issue: b10Total > 0 ? `${b10Total} external complaints pending full CAPA closure` : "No external defects logged",
              Module: "B10 - Customer Complaints",
              impact: b10Total > 0 ? "Risk to client scorecard and future purchase orders" : "Optimal brand reputation",
              status: b10Total > 0 ? "Critical" : "Open"
            },
            {
              Area: "B1 Material Receiving",
              issue: b1Defects > 0 ? "Raw material fabric/trim reject count noted" : "Acceptable incoming roll tolerance",
              Module: "B1 - Material Inspection",
              impact: "Panel yield reduction during cutting layups",
              status: b1Defects > 0 ? "Warning" : "Open"
            }
          ],
          predictions: [
            {
              risk: "Downstream shipment hold risk from AQL lot failures",
              probability: b5Fails > 0 ? 80 : 25,
              timeline: "Within 24 to 48 hours",
              affectedModule: "B5 - AQL Inspection",
              indicator: `${b5Fails} failed lots in active AQL records`
            },
            {
              risk: "Seam slippage and measurement variance on stretch lace",
              probability: Math.max(30, Math.min(85, Math.round(b3Defects * 3 + 20))),
              timeline: "Next 3 production days",
              affectedModule: "B3 - Inline Quality",
              indicator: "Hourly inspection deviation trends in sewing"
            },
            {
              risk: "Cutting panel dimensional drift due to fabric relaxation",
              probability: b1Defects > 0 ? 55 : 30,
              timeline: "1 week horizon",
              affectedModule: "B2 - Cutting Quality",
              indicator: "Material roll elasticity variances in B1"
            }
          ],
          capaMatrix: {
            immediate24h: [
              "Calibrate sewing needle thread tension on high-defect inline machines.",
              b5Fails > 0 ? "Quarantine failed AQL lots and mobilize 100% sorting team." : "Perform random cross-check on endline defect bins.",
              b10Total > 0 ? "Review active customer complaint samples with line supervisors." : "Audit cutting table bundle numbering accuracy."
            ],
            shortTerm7d: [
              "Conduct operator posture and seam alignment refresher training for high-rework operations.",
              "Review supplier fabric stretch test certificates prior to bulk roll layups.",
              "Update technical specifications in B9 SOP library for any modified seams."
            ],
            longTerm30d: [
              "Implement automated needle replacement schedules to eliminate needle cut defects.",
              "Deploy continuous statistical process control (SPC) charts across all zones.",
              "Conduct vendor quarterly quality reviews with B1 supplier defect scorecards."
            ]
          }
        };
      };
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey || apiKey.includes("PUT_YOUR_API_KEY") || apiKey.trim() === "") {
        console.log("[BLOSSOM AI] API key missing. Returning high-fidelity multi-module fallback.");
        return res.json(getFallbackProposal());
      }
      const ai = new import_genai.GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build"
          }
        }
      });
      const sliceLog = (arr) => Array.isArray(arr) ? arr.slice(-10) : [];
      const cleanData = {
        B1_Material: sliceLog(b1),
        B2_Cutting: sliceLog(b2),
        B3_Inline: sliceLog(b3),
        B4_Endline: sliceLog(b4),
        B5_AQL: sliceLog(b5),
        B6_FinalAudit: sliceLog(b6),
        B7_Workorders: sliceLog(b8).map((w) => ({ wo: w.workorderNumber, style: w.style, qty: w.orderQty, status: w.status })),
        B8_SOP_Documents: sliceLog(b9).map((s) => ({ title: s.title, type: s.sopType, category: s.category })),
        B9_CustomerComplaints: sliceLog(b10)
      };
      const prompt = `
      You are Blossom AI, the chief industrial QA intelligence system for intimate apparel, bra, and panty manufacturing.
      Analyze the entire quality operation spanning ALL 9 MODULES (B1 through B9):

      ================ FACTORY LEDGER SUMMARY ================
      - [B1] Material Inspection: ${b1.length} records, ${b1Checked} units checked, ${b1Defects} rejected (${b1Rate})
      - [B2] Cutting Quality: ${b2.length} records, ${b2Checked} pcs checked, ${b2Defects} rework/rejects (${b2Rate})
      - [B3] Inline Quality: ${b3.length} rounds, ${b3Checked} pcs inspected, ${b3Defects} complaints/defects (${b3Rate})
      - [B4] Endline Quality: ${b4.length} records, ${b4Checked} pcs checked, ${b4Defects} rework pieces (${b4Rate})
      - [B5] AQL Inspection: ${b5Lots} lots audited, ${b5Fails} failed lots, ${b5DefectPcs} defect pieces (${b5Rate})
      - [B6] Final Audit: ${b6Audits} pre-shipment checks, ${b6Rejects} carton/packing defects (${b6Rate})
      - [B7] Workorders Data: ${b8Total} workorders, ${b8Active} currently active, ${b8TotalQty.toLocaleString()} units planned
      - [B8] SOP & Audit Documents: ${b9Total} technical procedures and compliance documents active
      - [B9] Customer Complaints: ${b10Total} external complaints logged, ${b10Pieces} affected garments

      ================ RECENT RAW RECORD EXCERPTS ================
      ${JSON.stringify(cleanData, null, 2)}

      Tasks:
      1. Perform cross-module root-cause correlation (e.g., does fabric variance in B1 cause sizing defects in B4? Do high inline defects in B3 correspond to AQL lot failures in B5? Are customer complaints in B9 linked to missing B8 SOPs?).
      2. Provide a module-by-module audit for each of B1, B2, B3, B4, B5, B6, B7, B8, B9.
      3. Deliver high-precision CAPA recommendations with specific module tags.
      4. Forecast early warning risk predictions with probabilities and timelines.
      5. Formulate an actionable 24h / 7d / 30d CAPA matrix.

      Respond ONLY with valid JSON matching this schema:
      {
        "aiGenerated": true,
        "overallScore": 88,
        "qualityVerdict": "STABLE - CONTROLLED REWORK LEVEL",
        "summary": "Full multi-paragraph executive briefing analyzing the entire quality chain B1 to B9...",
        "moduleBreakdown": [
          {
            "moduleId": "B1",
            "name": "Material Report",
            "status": "OPTIMAL" | "STABLE" | "WARNING" | "CRITICAL",
            "score": 92,
            "totalRecords": ${b1.length},
            "defectCount": ${b1Defects},
            "rate": "${b1Rate}",
            "keyFindings": "Analytical insight for B1 based on the records",
            "actionRequired": "Specific preventive action for B1"
          },
          {
            "moduleId": "B2",
            "name": "Cutting Report",
            "status": "OPTIMAL" | "STABLE" | "WARNING" | "CRITICAL",
            "score": 90,
            "totalRecords": ${b2.length},
            "defectCount": ${b2Defects},
            "rate": "${b2Rate}",
            "keyFindings": "Analytical insight for B2",
            "actionRequired": "Specific preventive action for B2"
          },
          {
            "moduleId": "B3",
            "name": "Inline Report",
            "status": "OPTIMAL" | "STABLE" | "WARNING" | "CRITICAL",
            "score": 85,
            "totalRecords": ${b3.length},
            "defectCount": ${b3Defects},
            "rate": "${b3Rate}",
            "keyFindings": "Analytical insight for B3",
            "actionRequired": "Specific preventive action for B3"
          },
          {
            "moduleId": "B4",
            "name": "Endline Report",
            "status": "OPTIMAL" | "STABLE" | "WARNING" | "CRITICAL",
            "score": 86,
            "totalRecords": ${b4.length},
            "defectCount": ${b4Defects},
            "rate": "${b4Rate}",
            "keyFindings": "Analytical insight for B4",
            "actionRequired": "Specific preventive action for B4"
          },
          {
            "moduleId": "B5",
            "name": "AQL Report",
            "status": "OPTIMAL" | "STABLE" | "WARNING" | "CRITICAL",
            "score": 82,
            "totalRecords": ${b5Lots},
            "defectCount": ${b5DefectPcs},
            "rate": "${b5Rate}",
            "keyFindings": "Analytical insight for B5",
            "actionRequired": "Specific preventive action for B5"
          },
          {
            "moduleId": "B6",
            "name": "Final Audit Report",
            "status": "OPTIMAL" | "STABLE" | "WARNING" | "CRITICAL",
            "score": 94,
            "totalRecords": ${b6Audits},
            "defectCount": ${b6Rejects},
            "rate": "${b6Rate}",
            "keyFindings": "Analytical insight for B6",
            "actionRequired": "Specific preventive action for B6"
          },
          {
            "moduleId": "B7",
            "name": "Workorder Data",
            "status": "OPTIMAL" | "STABLE" | "WARNING" | "CRITICAL",
            "score": 92,
            "totalRecords": ${b8Total},
            "defectCount": 0,
            "rate": "${b8Active} Active Batches",
            "keyFindings": "Analytical insight for B7",
            "actionRequired": "Specific preventive action for B7"
          },
          {
            "moduleId": "B8",
            "name": "SOP & Audit Documents",
            "status": "OPTIMAL" | "STABLE" | "WARNING" | "CRITICAL",
            "score": 95,
            "totalRecords": ${b9Total},
            "defectCount": 0,
            "rate": "${b9Total} Active SOPs",
            "keyFindings": "Analytical insight for B8",
            "actionRequired": "Specific preventive action for B8"
          },
          {
            "moduleId": "B9",
            "name": "Customer Complaint Report",
            "status": "OPTIMAL" | "STABLE" | "WARNING" | "CRITICAL",
            "score": 88,
            "totalRecords": ${b10Total},
            "defectCount": ${b10Pieces},
            "rate": "${b10Total > 0 ? `${b10Pieces} Affected Pcs` : "Zero Complaints"}",
            "keyFindings": "Analytical insight for B9",
            "actionRequired": "Specific preventive action for B9"
          }
        ],
        "recommendations": [
          {
            "title": "Clear action title",
            "priority": "HIGH" | "MEDIUM" | "LOW",
            "description": "Specific CAPA details explicitly referencing modules like [B3], [B4], [B10], etc."
          }
        ],
        "identifiedProblems": [
          {
            "Area": "Specific manufacturing line, station, or dock",
            "issue": "Detailed failure or defect description",
            "Module": "B1 - Material" | "B2 - Cutting" | "B3 - Inline" | "B4 - Endline" | "B5 - AQL" | "B6 - Final Audit" | "B7 - Inspectors" | "B8 - Workorders" | "B9 - SOPs" | "B10 - Customer Complaints",
            "impact": "Quantified risk or rework consequence",
            "status": "Critical" | "Warning" | "Open"
          }
        ],
        "predictions": [
          {
            "risk": "Specific potential failure name",
            "probability": 75,
            "timeline": "e.g. Next 48 hours / 1 week",
            "affectedModule": "B3 - Inline Quality",
            "indicator": "Trigger pattern in logs"
          }
        ],
        "capaMatrix": {
          "immediate24h": ["Action 1", "Action 2"],
          "shortTerm7d": ["Action 1", "Action 2"],
          "longTerm30d": ["Action 1", "Action 2"]
        }
      }
      `;
      try {
        const response = await ai.models.generateContent({
          model: "gemini-3.8-flash",
          contents: prompt,
          config: {
            responseMimeType: "application/json"
          }
        });
        const textResponse = response.text || "";
        const parsed = extractJSON(textResponse);
        parsed.aiGenerated = true;
        parsed.score = Number(parsed.score || parsed.overallScore || overallScore || 85);
        parsed.overallScore = parsed.score;
        if (!Array.isArray(parsed.moduleBreakdown) || parsed.moduleBreakdown.length < 10) {
          const fb = getFallbackProposal();
          parsed.moduleBreakdown = fb.moduleBreakdown;
        }
        if (!parsed.capaMatrix) {
          const fb = getFallbackProposal();
          parsed.capaMatrix = fb.capaMatrix;
        }
        return res.json(parsed);
      } catch (genAiError) {
        console.error("[BLOSSOM AI SERVICE ERROR]", genAiError);
        const fallback = getFallbackProposal();
        fallback.summary += ` (Note: Adaptive high-fidelity statistical engine active: ${genAiError.message || "Standard load"})`;
        return res.json(fallback);
      }
    } catch (routeError) {
      console.error("[BLOSSOM ROUTE CRITICAL FAILURE]", routeError);
      return res.status(500).json({ success: false, error: routeError.message });
    }
  });
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });
  const uploadsDir = import_path.default.join(process.cwd(), "uploads");
  if (!import_fs.default.existsSync(uploadsDir)) {
    import_fs.default.mkdirSync(uploadsDir, { recursive: true });
  }
  app.use("/uploads", import_express.default.static(uploadsDir));
  app.post("/api/upload-offline", (req, res) => {
    try {
      const { fileName, base64Data, mimeType } = req.body;
      if (!fileName || !base64Data) {
        return res.status(400).json({ success: false, error: "Missing physical fileName or base64Data contents." });
      }
      const cleanBase64 = base64Data.replace(/^data:.*;base64,/, "");
      const buffer = Buffer.from(cleanBase64, "base64");
      const timestamp = Date.now();
      const safeName = `${timestamp}-${fileName.replace(/[^a-zA-Z0-9.-]/g, "_")}`;
      const filePath = import_path.default.join(uploadsDir, safeName);
      import_fs.default.writeFileSync(filePath, buffer);
      const relativeUrl = `/uploads/${safeName}`;
      console.log(`[LOCAL SAVER] PDF uploaded successfully. Saved locally to: ${filePath}`);
      return res.json({
        success: true,
        url: relativeUrl,
        name: safeName
      });
    } catch (e) {
      console.error("[LOCAL SAVER ERROR] Failed to save local file upload:", e);
      return res.status(500).json({ success: false, error: e.message || "Failed to save file on server chassis." });
    }
  });
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = import_path.default.join(process.cwd(), "dist");
    app.use(import_express.default.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(import_path.default.join(distPath, "index.html"));
    });
  }
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
    if (process.env.VITE_GAS_URL && !process.env.VITE_GAS_URL.includes("REPLACE_WITH")) {
      console.log("BASE CONFIG: Permanent VITE_GAS_URL detected in environment.");
    } else {
      console.log("BASE CONFIG: No permanent VITE_GAS_URL found. Relying on client-side setup.");
    }
  });
}
startServer();
//# sourceMappingURL=server.cjs.map
