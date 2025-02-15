"use strict";
/*
 * ATTENTION: An "eval-source-map" devtool has been used.
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file with attached SourceMaps in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
self["webpackHotUpdate_N_E"]("pages/index",{

/***/ "./components/mixer/Deposit.js":
/*!*************************************!*\
  !*** ./components/mixer/Deposit.js ***!
  \*************************************/
/***/ (function(module, __webpack_exports__, __webpack_require__) {

eval(__webpack_require__.ts("__webpack_require__.r(__webpack_exports__);\n/* harmony import */ var react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react/jsx-dev-runtime */ \"./node_modules/react/jsx-dev-runtime.js\");\n/* harmony import */ var react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! react */ \"./node_modules/react/index.js\");\n/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_1__);\n/* harmony import */ var _chakra_ui_react__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @chakra-ui/react */ \"./node_modules/@chakra-ui/react/dist/index.mjs\");\n/* harmony import */ var _config__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../config */ \"./config/index.js\");\n/* harmony import */ var _hooks_usePoseidon__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../../hooks/usePoseidon */ \"./hooks/usePoseidon.js\");\n/* provided dependency */ var Buffer = __webpack_require__(/*! buffer */ \"../../../../node_modules/buffer/index.js\")[\"Buffer\"];\n\nvar _s = $RefreshSig$();\n\n\n\n\nconst Deposit = (param)=>{\n    let { client, contractAddress } = param;\n    _s();\n    const [isDepositing, setIsDepositing] = (0,react__WEBPACK_IMPORTED_MODULE_1__.useState)(false);\n    const [secret, setSecret] = (0,react__WEBPACK_IMPORTED_MODULE_1__.useState)(\"\");\n    const { poseidon, isLoading, error } = (0,_hooks_usePoseidon__WEBPACK_IMPORTED_MODULE_3__.usePoseidon)();\n    const toast = (0,_chakra_ui_react__WEBPACK_IMPORTED_MODULE_4__.useToast)();\n    const generateRandomSecret = ()=>{\n        const randomBytes = new Uint8Array(32);\n        crypto.getRandomValues(randomBytes);\n        const secret = Buffer.from(randomBytes).toString(\"hex\");\n        setSecret(secret);\n    };\n    const handleDeposit = async ()=>{\n        try {\n            if (!poseidon) {\n                throw new Error(\"Poseidon hash function not initialized\");\n            }\n            setIsDepositing(true);\n            if (!secret) {\n                throw new Error(\"Please generate a secret first\");\n            }\n            // Convert secret to bigInt and calculate commitment\n            const secretBigInt = BigInt(\"0x\" + secret);\n            const hash = poseidon.F.toString(poseidon([\n                secretBigInt\n            ]));\n            const commitment = hash.toString();\n            console.log(\"Secret:\", secret);\n            console.log(\"Commitment:\", commitment);\n            // Execute deposit transaction\n            const result = await client.execute(contractAddress, {\n                deposit: {\n                    commitment: commitment\n                }\n            }, \"auto\", undefined, [\n                _config__WEBPACK_IMPORTED_MODULE_2__.config.DEPOSIT_AMOUNT\n            ]);\n            toast({\n                title: \"Deposit Successful!\",\n                description: \"Transaction hash: \".concat(result.transactionHash),\n                status: \"success\",\n                duration: 5000,\n                isClosable: true\n            });\n            // Save secret and commitment to local storage for withdrawal\n            const depositData = {\n                secret,\n                commitment,\n                timestamp: Date.now()\n            };\n            const deposits = JSON.parse(localStorage.getItem(\"deposits\") || \"[]\");\n            deposits.push(depositData);\n            localStorage.setItem(\"deposits\", JSON.stringify(deposits));\n        } catch (error) {\n            console.error(\"Deposit error:\", error);\n            toast({\n                title: \"Deposit Failed\",\n                description: error.message,\n                status: \"error\",\n                duration: 5000,\n                isClosable: true\n            });\n        } finally{\n            setIsDepositing(false);\n        }\n    };\n    if (isLoading) {\n        return /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(_chakra_ui_react__WEBPACK_IMPORTED_MODULE_4__.Box, {\n            p: 6,\n            borderWidth: 1,\n            borderRadius: \"lg\",\n            children: /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(_chakra_ui_react__WEBPACK_IMPORTED_MODULE_4__.VStack, {\n                spacing: 4,\n                align: \"center\",\n                children: [\n                    /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(_chakra_ui_react__WEBPACK_IMPORTED_MODULE_4__.Spinner, {\n                        size: \"xl\"\n                    }, void 0, false, {\n                        fileName: \"/home/latron/Desktop/julian-main/examples/frontend/components/mixer/Deposit.js\",\n                        lineNumber: 100,\n                        columnNumber: 11\n                    }, undefined),\n                    /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(_chakra_ui_react__WEBPACK_IMPORTED_MODULE_4__.Text, {\n                        children: \"Initializing Poseidon hash function...\"\n                    }, void 0, false, {\n                        fileName: \"/home/latron/Desktop/julian-main/examples/frontend/components/mixer/Deposit.js\",\n                        lineNumber: 101,\n                        columnNumber: 11\n                    }, undefined)\n                ]\n            }, void 0, true, {\n                fileName: \"/home/latron/Desktop/julian-main/examples/frontend/components/mixer/Deposit.js\",\n                lineNumber: 99,\n                columnNumber: 9\n            }, undefined)\n        }, void 0, false, {\n            fileName: \"/home/latron/Desktop/julian-main/examples/frontend/components/mixer/Deposit.js\",\n            lineNumber: 98,\n            columnNumber: 7\n        }, undefined);\n    }\n    if (error) {\n        return /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(_chakra_ui_react__WEBPACK_IMPORTED_MODULE_4__.Box, {\n            p: 6,\n            borderWidth: 1,\n            borderRadius: \"lg\",\n            children: /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(_chakra_ui_react__WEBPACK_IMPORTED_MODULE_4__.Alert, {\n                status: \"error\",\n                children: [\n                    /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(_chakra_ui_react__WEBPACK_IMPORTED_MODULE_4__.AlertIcon, {}, void 0, false, {\n                        fileName: \"/home/latron/Desktop/julian-main/examples/frontend/components/mixer/Deposit.js\",\n                        lineNumber: 111,\n                        columnNumber: 11\n                    }, undefined),\n                    \"Failed to initialize Poseidon hash function. Please refresh the page.\"\n                ]\n            }, void 0, true, {\n                fileName: \"/home/latron/Desktop/julian-main/examples/frontend/components/mixer/Deposit.js\",\n                lineNumber: 110,\n                columnNumber: 9\n            }, undefined)\n        }, void 0, false, {\n            fileName: \"/home/latron/Desktop/julian-main/examples/frontend/components/mixer/Deposit.js\",\n            lineNumber: 109,\n            columnNumber: 7\n        }, undefined);\n    }\n    return /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(_chakra_ui_react__WEBPACK_IMPORTED_MODULE_4__.Box, {\n        p: 6,\n        borderWidth: 1,\n        borderRadius: \"lg\",\n        children: /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(_chakra_ui_react__WEBPACK_IMPORTED_MODULE_4__.VStack, {\n            spacing: 4,\n            align: \"stretch\",\n            children: [\n                /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(_chakra_ui_react__WEBPACK_IMPORTED_MODULE_4__.Text, {\n                    fontSize: \"xl\",\n                    fontWeight: \"bold\",\n                    children: \"Deposit Funds\"\n                }, void 0, false, {\n                    fileName: \"/home/latron/Desktop/julian-main/examples/frontend/components/mixer/Deposit.js\",\n                    lineNumber: 121,\n                    columnNumber: 9\n                }, undefined),\n                /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(_chakra_ui_react__WEBPACK_IMPORTED_MODULE_4__.FormControl, {\n                    children: [\n                        /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(_chakra_ui_react__WEBPACK_IMPORTED_MODULE_4__.FormLabel, {\n                            children: \"Secret\"\n                        }, void 0, false, {\n                            fileName: \"/home/latron/Desktop/julian-main/examples/frontend/components/mixer/Deposit.js\",\n                            lineNumber: 126,\n                            columnNumber: 11\n                        }, undefined),\n                        /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(_chakra_ui_react__WEBPACK_IMPORTED_MODULE_4__.Input, {\n                            value: secret,\n                            isReadOnly: true,\n                            placeholder: \"Generate a random secret\"\n                        }, void 0, false, {\n                            fileName: \"/home/latron/Desktop/julian-main/examples/frontend/components/mixer/Deposit.js\",\n                            lineNumber: 127,\n                            columnNumber: 11\n                        }, undefined)\n                    ]\n                }, void 0, true, {\n                    fileName: \"/home/latron/Desktop/julian-main/examples/frontend/components/mixer/Deposit.js\",\n                    lineNumber: 125,\n                    columnNumber: 9\n                }, undefined),\n                /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(_chakra_ui_react__WEBPACK_IMPORTED_MODULE_4__.Text, {\n                    fontSize: \"sm\",\n                    color: \"gray.600\",\n                    children: [\n                        \"Deposit amount: \",\n                        parseInt(_config__WEBPACK_IMPORTED_MODULE_2__.config.DEPOSIT_AMOUNT.amount) / 1000000,\n                        \" \",\n                        _config__WEBPACK_IMPORTED_MODULE_2__.config.DEPOSIT_AMOUNT.denom.replace(\"u\", \"\").toUpperCase()\n                    ]\n                }, void 0, true, {\n                    fileName: \"/home/latron/Desktop/julian-main/examples/frontend/components/mixer/Deposit.js\",\n                    lineNumber: 134,\n                    columnNumber: 9\n                }, undefined),\n                /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(_chakra_ui_react__WEBPACK_IMPORTED_MODULE_4__.Button, {\n                    colorScheme: \"blue\",\n                    onClick: generateRandomSecret,\n                    isDisabled: isDepositing || !poseidon,\n                    children: \"Generate Random Secret\"\n                }, void 0, false, {\n                    fileName: \"/home/latron/Desktop/julian-main/examples/frontend/components/mixer/Deposit.js\",\n                    lineNumber: 138,\n                    columnNumber: 9\n                }, undefined),\n                /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(_chakra_ui_react__WEBPACK_IMPORTED_MODULE_4__.Button, {\n                    colorScheme: \"green\",\n                    onClick: handleDeposit,\n                    isLoading: isDepositing,\n                    loadingText: \"Depositing...\",\n                    isDisabled: !secret || !poseidon,\n                    children: \"Deposit\"\n                }, void 0, false, {\n                    fileName: \"/home/latron/Desktop/julian-main/examples/frontend/components/mixer/Deposit.js\",\n                    lineNumber: 146,\n                    columnNumber: 9\n                }, undefined)\n            ]\n        }, void 0, true, {\n            fileName: \"/home/latron/Desktop/julian-main/examples/frontend/components/mixer/Deposit.js\",\n            lineNumber: 120,\n            columnNumber: 7\n        }, undefined)\n    }, void 0, false, {\n        fileName: \"/home/latron/Desktop/julian-main/examples/frontend/components/mixer/Deposit.js\",\n        lineNumber: 119,\n        columnNumber: 5\n    }, undefined);\n};\n_s(Deposit, \"CZihU+46YdJf6yc2wH3bLfKh1xI=\", false, function() {\n    return [\n        _hooks_usePoseidon__WEBPACK_IMPORTED_MODULE_3__.usePoseidon,\n        _chakra_ui_react__WEBPACK_IMPORTED_MODULE_4__.useToast\n    ];\n});\n_c = Deposit;\n/* harmony default export */ __webpack_exports__[\"default\"] = (Deposit);\nvar _c;\n$RefreshReg$(_c, \"Deposit\");\n\n\n;\n    // Wrapped in an IIFE to avoid polluting the global scope\n    ;\n    (function () {\n        var _a, _b;\n        // Legacy CSS implementations will `eval` browser code in a Node.js context\n        // to extract CSS. For backwards compatibility, we need to check we're in a\n        // browser context before continuing.\n        if (typeof self !== 'undefined' &&\n            // AMP / No-JS mode does not inject these helpers:\n            '$RefreshHelpers$' in self) {\n            // @ts-ignore __webpack_module__ is global\n            var currentExports = module.exports;\n            // @ts-ignore __webpack_module__ is global\n            var prevSignature = (_b = (_a = module.hot.data) === null || _a === void 0 ? void 0 : _a.prevSignature) !== null && _b !== void 0 ? _b : null;\n            // This cannot happen in MainTemplate because the exports mismatch between\n            // templating and execution.\n            self.$RefreshHelpers$.registerExportsForReactRefresh(currentExports, module.id);\n            // A module can be accepted automatically based on its exports, e.g. when\n            // it is a Refresh Boundary.\n            if (self.$RefreshHelpers$.isReactRefreshBoundary(currentExports)) {\n                // Save the previous exports signature on update so we can compare the boundary\n                // signatures. We avoid saving exports themselves since it causes memory leaks (https://github.com/vercel/next.js/pull/53797)\n                module.hot.dispose(function (data) {\n                    data.prevSignature =\n                        self.$RefreshHelpers$.getRefreshBoundarySignature(currentExports);\n                });\n                // Unconditionally accept an update to this module, we'll check if it's\n                // still a Refresh Boundary later.\n                // @ts-ignore importMeta is replaced in the loader\n                module.hot.accept();\n                // This field is set when the previous version of this module was a\n                // Refresh Boundary, letting us know we need to check for invalidation or\n                // enqueue an update.\n                if (prevSignature !== null) {\n                    // A boundary can become ineligible if its exports are incompatible\n                    // with the previous exports.\n                    //\n                    // For example, if you add/remove/change exports, we'll want to\n                    // re-execute the importing modules, and force those components to\n                    // re-render. Similarly, if you convert a class component to a\n                    // function, we want to invalidate the boundary.\n                    if (self.$RefreshHelpers$.shouldInvalidateReactRefreshBoundary(prevSignature, self.$RefreshHelpers$.getRefreshBoundarySignature(currentExports))) {\n                        module.hot.invalidate();\n                    }\n                    else {\n                        self.$RefreshHelpers$.scheduleUpdate();\n                    }\n                }\n            }\n            else {\n                // Since we just executed the code for the module, it's possible that the\n                // new exports made it ineligible for being a boundary.\n                // We only care about the case when we were _previously_ a boundary,\n                // because we already accepted this update (accidental side effect).\n                var isNoLongerABoundary = prevSignature !== null;\n                if (isNoLongerABoundary) {\n                    module.hot.invalidate();\n                }\n            }\n        }\n    })();\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiLi9jb21wb25lbnRzL21peGVyL0RlcG9zaXQuanMiLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7QUFBaUM7QUFhUDtBQUNZO0FBQ2dCO0FBRXRELE1BQU1jLFVBQVU7UUFBQyxFQUFFQyxNQUFNLEVBQUVDLGVBQWUsRUFBRTs7SUFDMUMsTUFBTSxDQUFDQyxjQUFjQyxnQkFBZ0IsR0FBR2xCLCtDQUFRQSxDQUFDO0lBQ2pELE1BQU0sQ0FBQ21CLFFBQVFDLFVBQVUsR0FBR3BCLCtDQUFRQSxDQUFDO0lBQ3JDLE1BQU0sRUFBRXFCLFFBQVEsRUFBRUMsU0FBUyxFQUFFQyxLQUFLLEVBQUUsR0FBR1YsK0RBQVdBO0lBQ2xELE1BQU1XLFFBQVFuQiwwREFBUUE7SUFFdEIsTUFBTW9CLHVCQUF1QjtRQUMzQixNQUFNQyxjQUFjLElBQUlDLFdBQVc7UUFDbkNDLE9BQU9DLGVBQWUsQ0FBQ0g7UUFDdkIsTUFBTVAsU0FBU1csTUFBTUEsQ0FBQ0MsSUFBSSxDQUFDTCxhQUFhTSxRQUFRLENBQUM7UUFDakRaLFVBQVVEO0lBQ1o7SUFFQSxNQUFNYyxnQkFBZ0I7UUFDcEIsSUFBSTtZQUNGLElBQUksQ0FBQ1osVUFBVTtnQkFDYixNQUFNLElBQUlhLE1BQU07WUFDbEI7WUFFQWhCLGdCQUFnQjtZQUVoQixJQUFJLENBQUNDLFFBQVE7Z0JBQ1gsTUFBTSxJQUFJZSxNQUFNO1lBQ2xCO1lBRUEsb0RBQW9EO1lBQ3BELE1BQU1DLGVBQWVDLE9BQU8sT0FBT2pCO1lBQ25DLE1BQU1rQixPQUFPaEIsU0FBU2lCLENBQUMsQ0FBQ04sUUFBUSxDQUFDWCxTQUFTO2dCQUFDYzthQUFhO1lBQ3hELE1BQU1JLGFBQWFGLEtBQUtMLFFBQVE7WUFFaENRLFFBQVFDLEdBQUcsQ0FBQyxXQUFXdEI7WUFDdkJxQixRQUFRQyxHQUFHLENBQUMsZUFBZUY7WUFFM0IsOEJBQThCO1lBQzlCLE1BQU1HLFNBQVMsTUFBTTNCLE9BQU80QixPQUFPLENBQ2pDM0IsaUJBQ0E7Z0JBQ0U0QixTQUFTO29CQUNQTCxZQUFZQTtnQkFDZDtZQUNGLEdBQ0EsUUFDQU0sV0FDQTtnQkFBQ2pDLDJDQUFNQSxDQUFDa0MsY0FBYzthQUFDO1lBR3pCdEIsTUFBTTtnQkFDSnVCLE9BQU87Z0JBQ1BDLGFBQWEscUJBQTRDLE9BQXZCTixPQUFPTyxlQUFlO2dCQUN4REMsUUFBUTtnQkFDUkMsVUFBVTtnQkFDVkMsWUFBWTtZQUNkO1lBRUEsNkRBQTZEO1lBQzdELE1BQU1DLGNBQWM7Z0JBQ2xCbEM7Z0JBQ0FvQjtnQkFDQWUsV0FBV0MsS0FBS0MsR0FBRztZQUNyQjtZQUNBLE1BQU1DLFdBQVdDLEtBQUtDLEtBQUssQ0FBQ0MsYUFBYUMsT0FBTyxDQUFDLGVBQWU7WUFDaEVKLFNBQVNLLElBQUksQ0FBQ1Q7WUFDZE8sYUFBYUcsT0FBTyxDQUFDLFlBQVlMLEtBQUtNLFNBQVMsQ0FBQ1A7UUFFbEQsRUFBRSxPQUFPbEMsT0FBTztZQUNkaUIsUUFBUWpCLEtBQUssQ0FBQyxrQkFBa0JBO1lBQ2hDQyxNQUFNO2dCQUNKdUIsT0FBTztnQkFDUEMsYUFBYXpCLE1BQU0wQyxPQUFPO2dCQUMxQmYsUUFBUTtnQkFDUkMsVUFBVTtnQkFDVkMsWUFBWTtZQUNkO1FBQ0YsU0FBVTtZQUNSbEMsZ0JBQWdCO1FBQ2xCO0lBQ0Y7SUFFQSxJQUFJSSxXQUFXO1FBQ2IscUJBQ0UsOERBQUNyQixpREFBR0E7WUFBQ2lFLEdBQUc7WUFBR0MsYUFBYTtZQUFHQyxjQUFhO3NCQUN0Qyw0RUFBQ2hFLG9EQUFNQTtnQkFBQ2lFLFNBQVM7Z0JBQUdDLE9BQU07O2tDQUN4Qiw4REFBQzdELHFEQUFPQTt3QkFBQzhELE1BQUs7Ozs7OztrQ0FDZCw4REFBQ3BFLGtEQUFJQTtrQ0FBQzs7Ozs7Ozs7Ozs7Ozs7Ozs7SUFJZDtJQUVBLElBQUlvQixPQUFPO1FBQ1QscUJBQ0UsOERBQUN0QixpREFBR0E7WUFBQ2lFLEdBQUc7WUFBR0MsYUFBYTtZQUFHQyxjQUFhO3NCQUN0Qyw0RUFBQzFELG1EQUFLQTtnQkFBQ3dDLFFBQU87O2tDQUNaLDhEQUFDdkMsdURBQVNBOzs7OztvQkFBRzs7Ozs7Ozs7Ozs7O0lBS3JCO0lBRUEscUJBQ0UsOERBQUNWLGlEQUFHQTtRQUFDaUUsR0FBRztRQUFHQyxhQUFhO1FBQUdDLGNBQWE7a0JBQ3RDLDRFQUFDaEUsb0RBQU1BO1lBQUNpRSxTQUFTO1lBQUdDLE9BQU07OzhCQUN4Qiw4REFBQ25FLGtEQUFJQTtvQkFBQ3FFLFVBQVM7b0JBQUtDLFlBQVc7OEJBQU87Ozs7Ozs4QkFJdEMsOERBQUNsRSx5REFBV0E7O3NDQUNWLDhEQUFDQyx1REFBU0E7c0NBQUM7Ozs7OztzQ0FDWCw4REFBQ0YsbURBQUtBOzRCQUNKb0UsT0FBT3ZEOzRCQUNQd0QsVUFBVTs0QkFDVkMsYUFBWTs7Ozs7Ozs7Ozs7OzhCQUloQiw4REFBQ3pFLGtEQUFJQTtvQkFBQ3FFLFVBQVM7b0JBQUtLLE9BQU07O3dCQUFXO3dCQUNsQkMsU0FBU2xFLDJDQUFNQSxDQUFDa0MsY0FBYyxDQUFDaUMsTUFBTSxJQUFJO3dCQUFRO3dCQUFFbkUsMkNBQU1BLENBQUNrQyxjQUFjLENBQUNrQyxLQUFLLENBQUNDLE9BQU8sQ0FBQyxLQUFLLElBQUlDLFdBQVc7Ozs7Ozs7OEJBRzlILDhEQUFDaEYsb0RBQU1BO29CQUNMaUYsYUFBWTtvQkFDWkMsU0FBUzNEO29CQUNUNEQsWUFBWXBFLGdCQUFnQixDQUFDSTs4QkFDOUI7Ozs7Ozs4QkFJRCw4REFBQ25CLG9EQUFNQTtvQkFDTGlGLGFBQVk7b0JBQ1pDLFNBQVNuRDtvQkFDVFgsV0FBV0w7b0JBQ1hxRSxhQUFZO29CQUNaRCxZQUFZLENBQUNsRSxVQUFVLENBQUNFOzhCQUN6Qjs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFNVDtHQTVJTVA7O1FBR21DRCwyREFBV0E7UUFDcENSLHNEQUFRQTs7O0tBSmxCUztBQThJTiwrREFBZUEsT0FBT0EsRUFBQyIsInNvdXJjZXMiOlsid2VicGFjazovL19OX0UvLi9jb21wb25lbnRzL21peGVyL0RlcG9zaXQuanM/NDRjYiJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyB1c2VTdGF0ZSB9IGZyb20gJ3JlYWN0JztcbmltcG9ydCB7XG4gIEJveCxcbiAgQnV0dG9uLFxuICBUZXh0LFxuICBWU3RhY2ssXG4gIHVzZVRvYXN0LFxuICBJbnB1dCxcbiAgRm9ybUNvbnRyb2wsXG4gIEZvcm1MYWJlbCxcbiAgU3Bpbm5lcixcbiAgQWxlcnQsXG4gIEFsZXJ0SWNvbixcbn0gZnJvbSAnQGNoYWtyYS11aS9yZWFjdCc7XG5pbXBvcnQgeyBjb25maWcgfSBmcm9tICcuLi8uLi9jb25maWcnO1xuaW1wb3J0IHsgdXNlUG9zZWlkb24gfSBmcm9tICcuLi8uLi9ob29rcy91c2VQb3NlaWRvbic7XG5cbmNvbnN0IERlcG9zaXQgPSAoeyBjbGllbnQsIGNvbnRyYWN0QWRkcmVzcyB9KSA9PiB7XG4gIGNvbnN0IFtpc0RlcG9zaXRpbmcsIHNldElzRGVwb3NpdGluZ10gPSB1c2VTdGF0ZShmYWxzZSk7XG4gIGNvbnN0IFtzZWNyZXQsIHNldFNlY3JldF0gPSB1c2VTdGF0ZSgnJyk7XG4gIGNvbnN0IHsgcG9zZWlkb24sIGlzTG9hZGluZywgZXJyb3IgfSA9IHVzZVBvc2VpZG9uKCk7XG4gIGNvbnN0IHRvYXN0ID0gdXNlVG9hc3QoKTtcblxuICBjb25zdCBnZW5lcmF0ZVJhbmRvbVNlY3JldCA9ICgpID0+IHtcbiAgICBjb25zdCByYW5kb21CeXRlcyA9IG5ldyBVaW50OEFycmF5KDMyKTtcbiAgICBjcnlwdG8uZ2V0UmFuZG9tVmFsdWVzKHJhbmRvbUJ5dGVzKTtcbiAgICBjb25zdCBzZWNyZXQgPSBCdWZmZXIuZnJvbShyYW5kb21CeXRlcykudG9TdHJpbmcoJ2hleCcpO1xuICAgIHNldFNlY3JldChzZWNyZXQpO1xuICB9O1xuXG4gIGNvbnN0IGhhbmRsZURlcG9zaXQgPSBhc3luYyAoKSA9PiB7XG4gICAgdHJ5IHtcbiAgICAgIGlmICghcG9zZWlkb24pIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdQb3NlaWRvbiBoYXNoIGZ1bmN0aW9uIG5vdCBpbml0aWFsaXplZCcpO1xuICAgICAgfVxuXG4gICAgICBzZXRJc0RlcG9zaXRpbmcodHJ1ZSk7XG5cbiAgICAgIGlmICghc2VjcmV0KSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcignUGxlYXNlIGdlbmVyYXRlIGEgc2VjcmV0IGZpcnN0Jyk7XG4gICAgICB9XG5cbiAgICAgIC8vIENvbnZlcnQgc2VjcmV0IHRvIGJpZ0ludCBhbmQgY2FsY3VsYXRlIGNvbW1pdG1lbnRcbiAgICAgIGNvbnN0IHNlY3JldEJpZ0ludCA9IEJpZ0ludCgnMHgnICsgc2VjcmV0KTtcbiAgICAgIGNvbnN0IGhhc2ggPSBwb3NlaWRvbi5GLnRvU3RyaW5nKHBvc2VpZG9uKFtzZWNyZXRCaWdJbnRdKSk7XG4gICAgICBjb25zdCBjb21taXRtZW50ID0gaGFzaC50b1N0cmluZygpO1xuXG4gICAgICBjb25zb2xlLmxvZygnU2VjcmV0OicsIHNlY3JldCk7XG4gICAgICBjb25zb2xlLmxvZygnQ29tbWl0bWVudDonLCBjb21taXRtZW50KTtcblxuICAgICAgLy8gRXhlY3V0ZSBkZXBvc2l0IHRyYW5zYWN0aW9uXG4gICAgICBjb25zdCByZXN1bHQgPSBhd2FpdCBjbGllbnQuZXhlY3V0ZShcbiAgICAgICAgY29udHJhY3RBZGRyZXNzLFxuICAgICAgICB7XG4gICAgICAgICAgZGVwb3NpdDoge1xuICAgICAgICAgICAgY29tbWl0bWVudDogY29tbWl0bWVudCxcbiAgICAgICAgICB9LFxuICAgICAgICB9LFxuICAgICAgICBcImF1dG9cIixcbiAgICAgICAgdW5kZWZpbmVkLFxuICAgICAgICBbY29uZmlnLkRFUE9TSVRfQU1PVU5UXVxuICAgICAgKTtcblxuICAgICAgdG9hc3Qoe1xuICAgICAgICB0aXRsZTogJ0RlcG9zaXQgU3VjY2Vzc2Z1bCEnLFxuICAgICAgICBkZXNjcmlwdGlvbjogYFRyYW5zYWN0aW9uIGhhc2g6ICR7cmVzdWx0LnRyYW5zYWN0aW9uSGFzaH1gLFxuICAgICAgICBzdGF0dXM6ICdzdWNjZXNzJyxcbiAgICAgICAgZHVyYXRpb246IDUwMDAsXG4gICAgICAgIGlzQ2xvc2FibGU6IHRydWUsXG4gICAgICB9KTtcblxuICAgICAgLy8gU2F2ZSBzZWNyZXQgYW5kIGNvbW1pdG1lbnQgdG8gbG9jYWwgc3RvcmFnZSBmb3Igd2l0aGRyYXdhbFxuICAgICAgY29uc3QgZGVwb3NpdERhdGEgPSB7XG4gICAgICAgIHNlY3JldCxcbiAgICAgICAgY29tbWl0bWVudCxcbiAgICAgICAgdGltZXN0YW1wOiBEYXRlLm5vdygpLFxuICAgICAgfTtcbiAgICAgIGNvbnN0IGRlcG9zaXRzID0gSlNPTi5wYXJzZShsb2NhbFN0b3JhZ2UuZ2V0SXRlbSgnZGVwb3NpdHMnKSB8fCAnW10nKTtcbiAgICAgIGRlcG9zaXRzLnB1c2goZGVwb3NpdERhdGEpO1xuICAgICAgbG9jYWxTdG9yYWdlLnNldEl0ZW0oJ2RlcG9zaXRzJywgSlNPTi5zdHJpbmdpZnkoZGVwb3NpdHMpKTtcblxuICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICBjb25zb2xlLmVycm9yKCdEZXBvc2l0IGVycm9yOicsIGVycm9yKTtcbiAgICAgIHRvYXN0KHtcbiAgICAgICAgdGl0bGU6ICdEZXBvc2l0IEZhaWxlZCcsXG4gICAgICAgIGRlc2NyaXB0aW9uOiBlcnJvci5tZXNzYWdlLFxuICAgICAgICBzdGF0dXM6ICdlcnJvcicsXG4gICAgICAgIGR1cmF0aW9uOiA1MDAwLFxuICAgICAgICBpc0Nsb3NhYmxlOiB0cnVlLFxuICAgICAgfSk7XG4gICAgfSBmaW5hbGx5IHtcbiAgICAgIHNldElzRGVwb3NpdGluZyhmYWxzZSk7XG4gICAgfVxuICB9O1xuXG4gIGlmIChpc0xvYWRpbmcpIHtcbiAgICByZXR1cm4gKFxuICAgICAgPEJveCBwPXs2fSBib3JkZXJXaWR0aD17MX0gYm9yZGVyUmFkaXVzPVwibGdcIj5cbiAgICAgICAgPFZTdGFjayBzcGFjaW5nPXs0fSBhbGlnbj1cImNlbnRlclwiPlxuICAgICAgICAgIDxTcGlubmVyIHNpemU9XCJ4bFwiIC8+XG4gICAgICAgICAgPFRleHQ+SW5pdGlhbGl6aW5nIFBvc2VpZG9uIGhhc2ggZnVuY3Rpb24uLi48L1RleHQ+XG4gICAgICAgIDwvVlN0YWNrPlxuICAgICAgPC9Cb3g+XG4gICAgKTtcbiAgfVxuXG4gIGlmIChlcnJvcikge1xuICAgIHJldHVybiAoXG4gICAgICA8Qm94IHA9ezZ9IGJvcmRlcldpZHRoPXsxfSBib3JkZXJSYWRpdXM9XCJsZ1wiPlxuICAgICAgICA8QWxlcnQgc3RhdHVzPVwiZXJyb3JcIj5cbiAgICAgICAgICA8QWxlcnRJY29uIC8+XG4gICAgICAgICAgRmFpbGVkIHRvIGluaXRpYWxpemUgUG9zZWlkb24gaGFzaCBmdW5jdGlvbi4gUGxlYXNlIHJlZnJlc2ggdGhlIHBhZ2UuXG4gICAgICAgIDwvQWxlcnQ+XG4gICAgICA8L0JveD5cbiAgICApO1xuICB9XG5cbiAgcmV0dXJuIChcbiAgICA8Qm94IHA9ezZ9IGJvcmRlcldpZHRoPXsxfSBib3JkZXJSYWRpdXM9XCJsZ1wiPlxuICAgICAgPFZTdGFjayBzcGFjaW5nPXs0fSBhbGlnbj1cInN0cmV0Y2hcIj5cbiAgICAgICAgPFRleHQgZm9udFNpemU9XCJ4bFwiIGZvbnRXZWlnaHQ9XCJib2xkXCI+XG4gICAgICAgICAgRGVwb3NpdCBGdW5kc1xuICAgICAgICA8L1RleHQ+XG4gICAgICAgIFxuICAgICAgICA8Rm9ybUNvbnRyb2w+XG4gICAgICAgICAgPEZvcm1MYWJlbD5TZWNyZXQ8L0Zvcm1MYWJlbD5cbiAgICAgICAgICA8SW5wdXRcbiAgICAgICAgICAgIHZhbHVlPXtzZWNyZXR9XG4gICAgICAgICAgICBpc1JlYWRPbmx5XG4gICAgICAgICAgICBwbGFjZWhvbGRlcj1cIkdlbmVyYXRlIGEgcmFuZG9tIHNlY3JldFwiXG4gICAgICAgICAgLz5cbiAgICAgICAgPC9Gb3JtQ29udHJvbD5cblxuICAgICAgICA8VGV4dCBmb250U2l6ZT1cInNtXCIgY29sb3I9XCJncmF5LjYwMFwiPlxuICAgICAgICAgIERlcG9zaXQgYW1vdW50OiB7cGFyc2VJbnQoY29uZmlnLkRFUE9TSVRfQU1PVU5ULmFtb3VudCkgLyAxMDAwMDAwfSB7Y29uZmlnLkRFUE9TSVRfQU1PVU5ULmRlbm9tLnJlcGxhY2UoJ3UnLCAnJykudG9VcHBlckNhc2UoKX1cbiAgICAgICAgPC9UZXh0PlxuXG4gICAgICAgIDxCdXR0b25cbiAgICAgICAgICBjb2xvclNjaGVtZT1cImJsdWVcIlxuICAgICAgICAgIG9uQ2xpY2s9e2dlbmVyYXRlUmFuZG9tU2VjcmV0fVxuICAgICAgICAgIGlzRGlzYWJsZWQ9e2lzRGVwb3NpdGluZyB8fCAhcG9zZWlkb259XG4gICAgICAgID5cbiAgICAgICAgICBHZW5lcmF0ZSBSYW5kb20gU2VjcmV0XG4gICAgICAgIDwvQnV0dG9uPlxuXG4gICAgICAgIDxCdXR0b25cbiAgICAgICAgICBjb2xvclNjaGVtZT1cImdyZWVuXCJcbiAgICAgICAgICBvbkNsaWNrPXtoYW5kbGVEZXBvc2l0fVxuICAgICAgICAgIGlzTG9hZGluZz17aXNEZXBvc2l0aW5nfVxuICAgICAgICAgIGxvYWRpbmdUZXh0PVwiRGVwb3NpdGluZy4uLlwiXG4gICAgICAgICAgaXNEaXNhYmxlZD17IXNlY3JldCB8fCAhcG9zZWlkb259XG4gICAgICAgID5cbiAgICAgICAgICBEZXBvc2l0XG4gICAgICAgIDwvQnV0dG9uPlxuICAgICAgPC9WU3RhY2s+XG4gICAgPC9Cb3g+XG4gICk7XG59O1xuXG5leHBvcnQgZGVmYXVsdCBEZXBvc2l0OyAiXSwibmFtZXMiOlsidXNlU3RhdGUiLCJCb3giLCJCdXR0b24iLCJUZXh0IiwiVlN0YWNrIiwidXNlVG9hc3QiLCJJbnB1dCIsIkZvcm1Db250cm9sIiwiRm9ybUxhYmVsIiwiU3Bpbm5lciIsIkFsZXJ0IiwiQWxlcnRJY29uIiwiY29uZmlnIiwidXNlUG9zZWlkb24iLCJEZXBvc2l0IiwiY2xpZW50IiwiY29udHJhY3RBZGRyZXNzIiwiaXNEZXBvc2l0aW5nIiwic2V0SXNEZXBvc2l0aW5nIiwic2VjcmV0Iiwic2V0U2VjcmV0IiwicG9zZWlkb24iLCJpc0xvYWRpbmciLCJlcnJvciIsInRvYXN0IiwiZ2VuZXJhdGVSYW5kb21TZWNyZXQiLCJyYW5kb21CeXRlcyIsIlVpbnQ4QXJyYXkiLCJjcnlwdG8iLCJnZXRSYW5kb21WYWx1ZXMiLCJCdWZmZXIiLCJmcm9tIiwidG9TdHJpbmciLCJoYW5kbGVEZXBvc2l0IiwiRXJyb3IiLCJzZWNyZXRCaWdJbnQiLCJCaWdJbnQiLCJoYXNoIiwiRiIsImNvbW1pdG1lbnQiLCJjb25zb2xlIiwibG9nIiwicmVzdWx0IiwiZXhlY3V0ZSIsImRlcG9zaXQiLCJ1bmRlZmluZWQiLCJERVBPU0lUX0FNT1VOVCIsInRpdGxlIiwiZGVzY3JpcHRpb24iLCJ0cmFuc2FjdGlvbkhhc2giLCJzdGF0dXMiLCJkdXJhdGlvbiIsImlzQ2xvc2FibGUiLCJkZXBvc2l0RGF0YSIsInRpbWVzdGFtcCIsIkRhdGUiLCJub3ciLCJkZXBvc2l0cyIsIkpTT04iLCJwYXJzZSIsImxvY2FsU3RvcmFnZSIsImdldEl0ZW0iLCJwdXNoIiwic2V0SXRlbSIsInN0cmluZ2lmeSIsIm1lc3NhZ2UiLCJwIiwiYm9yZGVyV2lkdGgiLCJib3JkZXJSYWRpdXMiLCJzcGFjaW5nIiwiYWxpZ24iLCJzaXplIiwiZm9udFNpemUiLCJmb250V2VpZ2h0IiwidmFsdWUiLCJpc1JlYWRPbmx5IiwicGxhY2Vob2xkZXIiLCJjb2xvciIsInBhcnNlSW50IiwiYW1vdW50IiwiZGVub20iLCJyZXBsYWNlIiwidG9VcHBlckNhc2UiLCJjb2xvclNjaGVtZSIsIm9uQ2xpY2siLCJpc0Rpc2FibGVkIiwibG9hZGluZ1RleHQiXSwic291cmNlUm9vdCI6IiJ9\n//# sourceURL=webpack-internal:///./components/mixer/Deposit.js\n"));

/***/ }),

/***/ "./hooks/usePoseidon.js":
/*!******************************!*\
  !*** ./hooks/usePoseidon.js ***!
  \******************************/
/***/ (function(module, __webpack_exports__, __webpack_require__) {

eval(__webpack_require__.ts("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   usePoseidon: function() { return /* binding */ usePoseidon; }\n/* harmony export */ });\n/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ \"./node_modules/react/index.js\");\n/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);\nvar _s = $RefreshSig$();\n\nfunction usePoseidon() {\n    _s();\n    const [poseidon, setPoseidon] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)(null);\n    const [isLoading, setIsLoading] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)(true);\n    const [error, setError] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)(null);\n    (0,react__WEBPACK_IMPORTED_MODULE_0__.useEffect)(()=>{\n        let mounted = true;\n        const initPoseidon = async ()=>{\n            try {\n                if (false) {}\n                setIsLoading(true);\n                const { buildPoseidon } = await __webpack_require__.e(/*! import() */ \"node_modules_circomlibjs_main_js\").then(__webpack_require__.bind(__webpack_require__, /*! circomlibjs */ \"./node_modules/circomlibjs/main.js\"));\n                const poseidonInstance = await buildPoseidon();\n                if (mounted) {\n                    setPoseidon(poseidonInstance);\n                    setIsLoading(false);\n                }\n            } catch (err) {\n                console.error(\"Failed to initialize Poseidon:\", err);\n                if (mounted) {\n                    setError(err);\n                    setIsLoading(false);\n                }\n            }\n        };\n        initPoseidon();\n        return ()=>{\n            mounted = false;\n        };\n    }, []);\n    return {\n        poseidon,\n        isLoading,\n        error\n    };\n}\n_s(usePoseidon, \"pC7OOBr/TnQ4JJIUrlTFMwpa4cg=\");\n\n\n;\n    // Wrapped in an IIFE to avoid polluting the global scope\n    ;\n    (function () {\n        var _a, _b;\n        // Legacy CSS implementations will `eval` browser code in a Node.js context\n        // to extract CSS. For backwards compatibility, we need to check we're in a\n        // browser context before continuing.\n        if (typeof self !== 'undefined' &&\n            // AMP / No-JS mode does not inject these helpers:\n            '$RefreshHelpers$' in self) {\n            // @ts-ignore __webpack_module__ is global\n            var currentExports = module.exports;\n            // @ts-ignore __webpack_module__ is global\n            var prevSignature = (_b = (_a = module.hot.data) === null || _a === void 0 ? void 0 : _a.prevSignature) !== null && _b !== void 0 ? _b : null;\n            // This cannot happen in MainTemplate because the exports mismatch between\n            // templating and execution.\n            self.$RefreshHelpers$.registerExportsForReactRefresh(currentExports, module.id);\n            // A module can be accepted automatically based on its exports, e.g. when\n            // it is a Refresh Boundary.\n            if (self.$RefreshHelpers$.isReactRefreshBoundary(currentExports)) {\n                // Save the previous exports signature on update so we can compare the boundary\n                // signatures. We avoid saving exports themselves since it causes memory leaks (https://github.com/vercel/next.js/pull/53797)\n                module.hot.dispose(function (data) {\n                    data.prevSignature =\n                        self.$RefreshHelpers$.getRefreshBoundarySignature(currentExports);\n                });\n                // Unconditionally accept an update to this module, we'll check if it's\n                // still a Refresh Boundary later.\n                // @ts-ignore importMeta is replaced in the loader\n                module.hot.accept();\n                // This field is set when the previous version of this module was a\n                // Refresh Boundary, letting us know we need to check for invalidation or\n                // enqueue an update.\n                if (prevSignature !== null) {\n                    // A boundary can become ineligible if its exports are incompatible\n                    // with the previous exports.\n                    //\n                    // For example, if you add/remove/change exports, we'll want to\n                    // re-execute the importing modules, and force those components to\n                    // re-render. Similarly, if you convert a class component to a\n                    // function, we want to invalidate the boundary.\n                    if (self.$RefreshHelpers$.shouldInvalidateReactRefreshBoundary(prevSignature, self.$RefreshHelpers$.getRefreshBoundarySignature(currentExports))) {\n                        module.hot.invalidate();\n                    }\n                    else {\n                        self.$RefreshHelpers$.scheduleUpdate();\n                    }\n                }\n            }\n            else {\n                // Since we just executed the code for the module, it's possible that the\n                // new exports made it ineligible for being a boundary.\n                // We only care about the case when we were _previously_ a boundary,\n                // because we already accepted this update (accidental side effect).\n                var isNoLongerABoundary = prevSignature !== null;\n                if (isNoLongerABoundary) {\n                    module.hot.invalidate();\n                }\n            }\n        }\n    })();\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiLi9ob29rcy91c2VQb3NlaWRvbi5qcyIsIm1hcHBpbmdzIjoiOzs7Ozs7O0FBQTRDO0FBRXJDLFNBQVNFOztJQUNkLE1BQU0sQ0FBQ0MsVUFBVUMsWUFBWSxHQUFHSiwrQ0FBUUEsQ0FBQztJQUN6QyxNQUFNLENBQUNLLFdBQVdDLGFBQWEsR0FBR04sK0NBQVFBLENBQUM7SUFDM0MsTUFBTSxDQUFDTyxPQUFPQyxTQUFTLEdBQUdSLCtDQUFRQSxDQUFDO0lBRW5DQyxnREFBU0EsQ0FBQztRQUNSLElBQUlRLFVBQVU7UUFFZCxNQUFNQyxlQUFlO1lBQ25CLElBQUk7Z0JBQ0YsSUFBSSxLQUFrQixFQUFhLEVBQU87Z0JBRTFDSixhQUFhO2dCQUNiLE1BQU0sRUFBRUssYUFBYSxFQUFFLEdBQUcsTUFBTSxzTEFBTztnQkFDdkMsTUFBTUMsbUJBQW1CLE1BQU1EO2dCQUUvQixJQUFJRixTQUFTO29CQUNYTCxZQUFZUTtvQkFDWk4sYUFBYTtnQkFDZjtZQUNGLEVBQUUsT0FBT08sS0FBSztnQkFDWkMsUUFBUVAsS0FBSyxDQUFDLGtDQUFrQ007Z0JBQ2hELElBQUlKLFNBQVM7b0JBQ1hELFNBQVNLO29CQUNUUCxhQUFhO2dCQUNmO1lBQ0Y7UUFDRjtRQUVBSTtRQUVBLE9BQU87WUFDTEQsVUFBVTtRQUNaO0lBQ0YsR0FBRyxFQUFFO0lBRUwsT0FBTztRQUFFTjtRQUFVRTtRQUFXRTtJQUFNO0FBQ3RDO0dBckNnQkwiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9fTl9FLy4vaG9va3MvdXNlUG9zZWlkb24uanM/MTBjOSJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyB1c2VTdGF0ZSwgdXNlRWZmZWN0IH0gZnJvbSAncmVhY3QnO1xuXG5leHBvcnQgZnVuY3Rpb24gdXNlUG9zZWlkb24oKSB7XG4gIGNvbnN0IFtwb3NlaWRvbiwgc2V0UG9zZWlkb25dID0gdXNlU3RhdGUobnVsbCk7XG4gIGNvbnN0IFtpc0xvYWRpbmcsIHNldElzTG9hZGluZ10gPSB1c2VTdGF0ZSh0cnVlKTtcbiAgY29uc3QgW2Vycm9yLCBzZXRFcnJvcl0gPSB1c2VTdGF0ZShudWxsKTtcblxuICB1c2VFZmZlY3QoKCkgPT4ge1xuICAgIGxldCBtb3VudGVkID0gdHJ1ZTtcblxuICAgIGNvbnN0IGluaXRQb3NlaWRvbiA9IGFzeW5jICgpID0+IHtcbiAgICAgIHRyeSB7XG4gICAgICAgIGlmICh0eXBlb2Ygd2luZG93ID09PSAndW5kZWZpbmVkJykgcmV0dXJuO1xuXG4gICAgICAgIHNldElzTG9hZGluZyh0cnVlKTtcbiAgICAgICAgY29uc3QgeyBidWlsZFBvc2VpZG9uIH0gPSBhd2FpdCBpbXBvcnQoJ2NpcmNvbWxpYmpzJyk7XG4gICAgICAgIGNvbnN0IHBvc2VpZG9uSW5zdGFuY2UgPSBhd2FpdCBidWlsZFBvc2VpZG9uKCk7XG4gICAgICAgIFxuICAgICAgICBpZiAobW91bnRlZCkge1xuICAgICAgICAgIHNldFBvc2VpZG9uKHBvc2VpZG9uSW5zdGFuY2UpO1xuICAgICAgICAgIHNldElzTG9hZGluZyhmYWxzZSk7XG4gICAgICAgIH1cbiAgICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICBjb25zb2xlLmVycm9yKCdGYWlsZWQgdG8gaW5pdGlhbGl6ZSBQb3NlaWRvbjonLCBlcnIpO1xuICAgICAgICBpZiAobW91bnRlZCkge1xuICAgICAgICAgIHNldEVycm9yKGVycik7XG4gICAgICAgICAgc2V0SXNMb2FkaW5nKGZhbHNlKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH07XG5cbiAgICBpbml0UG9zZWlkb24oKTtcblxuICAgIHJldHVybiAoKSA9PiB7XG4gICAgICBtb3VudGVkID0gZmFsc2U7XG4gICAgfTtcbiAgfSwgW10pO1xuXG4gIHJldHVybiB7IHBvc2VpZG9uLCBpc0xvYWRpbmcsIGVycm9yIH07XG59ICJdLCJuYW1lcyI6WyJ1c2VTdGF0ZSIsInVzZUVmZmVjdCIsInVzZVBvc2VpZG9uIiwicG9zZWlkb24iLCJzZXRQb3NlaWRvbiIsImlzTG9hZGluZyIsInNldElzTG9hZGluZyIsImVycm9yIiwic2V0RXJyb3IiLCJtb3VudGVkIiwiaW5pdFBvc2VpZG9uIiwiYnVpbGRQb3NlaWRvbiIsInBvc2VpZG9uSW5zdGFuY2UiLCJlcnIiLCJjb25zb2xlIl0sInNvdXJjZVJvb3QiOiIifQ==\n//# sourceURL=webpack-internal:///./hooks/usePoseidon.js\n"));

/***/ })

});