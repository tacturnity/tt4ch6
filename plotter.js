document.addEventListener('DOMContentLoaded', function () {
    // Add a small delay to ensure DOM is fully ready and Plotly might be loaded
    // Adjust delay if needed, or rely solely on checking typeof Plotly
    setTimeout(() => {
        if (typeof Plotly === 'undefined') {
            console.error("Plotly.js not loaded or still loading. Graphs cannot be generated.");
            // Attempt to select placeholders and add error message
            const plotDivs = document.querySelectorAll('.plot');
            plotDivs.forEach(div => {
                div.innerHTML = '<p style="color: #e74c3c; text-align: center; padding: 20px;">Graph library failed to load.</p>';
            });
            return;
        }
         console.log("Plotly loaded, generating graphs...");


        // --- Shared Plotting Configuration ---
        const commonLayout = {
            template: 'plotly_dark', // Use Plotly's dark theme
            xaxis: { title: {text: 'v (m³/kg)', font: {color: '#bbb'}}, zeroline: false, gridcolor: '#444', tickfont: {color: '#bbb'}, linecolor: '#666' },
            yaxis: { title: {text:'P (kPa)', font: {color: '#bbb'}}, zeroline: false, gridcolor: '#444', tickfont: {color: '#bbb'}, linecolor: '#666' },
            margin: { l: 70, r: 30, t: 60, b: 60 }, // Adjusted margins
            showlegend: false,
             title: { font: { color: '#f0f0f0'} },
            font: {
               family: 'Lato, sans-serif',
               color: '#e0e0e0' // Default font color for annotations etc.
           },
            paper_bgcolor: '#2a2a2a', // Match container background
            plot_bgcolor: '#1e1e1e',   // Match body background
        };

        const commonLayoutTs = {
             ...commonLayout,
            xaxis: { ...commonLayout.xaxis, title: {text: 's (kJ/kg·K)', font: {color: '#bbb'}}},
            yaxis: { ...commonLayout.yaxis, title: {text: 'T (K or °C)', font: {color: '#bbb'}} },
        };

        // Helper to generate a simple vapor dome (illustrative)
        function getDomeTrace(x_axis = 'v', y_axis = 'P') {
             let dome_x, dome_y;

             if (x_axis === 'v' && y_axis === 'P') {
                 dome_x = [0.001, 0.0015, 0.05, 0.5, 1.5, 1, 0.2, 0.002, 0.001]; // Example points P-v
                 dome_y = [100, 500, 1000, 2000, 2000, 2000, 1500, 500, 100]; // Adjusted P values
             } else if (x_axis === 's' && y_axis === 'T') {
                 dome_x = [1, 1.5, 2.5, 4, 5.5, 6.5, 7, 6, 4, 2, 1]; // More points for T-s dome
                 dome_y = [100, 150, 250, 350, 400, 400, 400, 380, 300, 150, 100]; // Example temperatures K
             } else { // Default / Fallback
                 dome_x = [0.001, 0.1, 1.5, 0.1, 0.001];
                 dome_y = [100, 1000, 1000, 100, 100];
            }

            return {
                x: dome_x, y: dome_y, mode: 'lines',
                line: { color: '#666', width: 2, dash: 'dot' }, // Dimmer grey for dome
                name: 'Vapor Dome', hoverinfo: 'none'
            };
        }

        // Helper to create state points
         function getStateTrace(x, y, name, text = '', color = '#e74c3c', symbol = 'circle') {
            return {
                 x: [x], y: [y],
                 mode: 'markers+text', // Show text next to marker
                 marker: { color: color, size: 10, symbol: symbol, line: {color: '#1e1e1e', width: 1}}, // Red markers with border
                 name: name,
                 text: [text || name], // Text for hover & display
                 textposition: 'top right',
                 textfont: { color: '#ddd', size: 11 },
                 hoverinfo: 'text', // Only show text on hover
            };
        }

         // Helper to create process lines/curves
        function getProcessTrace(x_coords, y_coords, line_type = 'line', dash_style = 'solid') {
           let mode = 'lines';
           let line_shape = 'linear';
           if (line_type === 'curve') line_shape = 'spline';

           return {
              x: x_coords, y: y_coords, mode: mode,
              line: { color: '#3498db', width: 2.5, shape: line_shape, dash: dash_style }, // Brighter Blue line
              hoverinfo: 'none'
           }
        }


        // --- Plotting Functions ---

        function plotQ1() {
             if (!document.getElementById('q1-pv-diagram')) return; // Check if div exists
            // N2 P=2000, T=120 (SH) => s=5.1887. Approx v > vg. vg@120K = 0.00705. Say v=0.009
            // N2 T=120, v=0.005 (Mix) => P=2075, s=4.4815
            // R410a T=25C(298K), v=0.01 (Mix) => P=1659, s=1.6905
            const T_UNIT = 'K';

            const state_a = { v: 0.009, P: 2000, s: 5.1887, T: 120 };
            const state_b = { v: 0.005, P: 2075, s: 4.4815, T: 120 };
            const state_c = { v: 0.010, P: 1659, s: 1.6905, T: 298.15 };

            const layout_pv = { ...commonLayout, title: 'Q1: P-v Diagram (N2, R410a)', yaxis: {...commonLayout.yaxis, type: 'log'} };
             layout_pv.xaxis.range = [0, 0.015];
             layout_pv.yaxis.range = [Math.log10(1000), Math.log10(3000)];
            Plotly.newPlot('q1-pv-diagram', [
                 getDomeTrace('v', 'P'), // Representative dome
                 getStateTrace(state_a.v, state_a.P, 'A'),
                 getStateTrace(state_b.v, state_b.P, 'B'),
                 getStateTrace(state_c.v, state_c.P, 'C', 'C', '#ff7f0e') // Different color for R410A
            ], layout_pv);

             const layout_ts = { ...commonLayoutTs, title: 'Q1: T-s Diagram (N2, R410a)', yaxis: {title: `T(${T_UNIT})`}};
             layout_ts.xaxis.range = [1, 6];
             layout_ts.yaxis.range = [50, 350];
             Plotly.newPlot('q1-ts-diagram', [
                getDomeTrace('s', 'T'), // Representative dome
                getStateTrace(state_a.s, state_a.T, 'A'),
                getStateTrace(state_b.s, state_b.T, 'B'),
                getStateTrace(state_c.s, state_c.T, 'C', 'C', '#ff7f0e')
             ], layout_ts);
        }

         function plotQ2() {
             if (!document.getElementById('q2-pv-diagram')) return;
            const T_UNIT = '°C';
            const P_CONST = 200; // kPa
            const state_1 = { P: P_CONST, T: 120.21, x: 0.25, s: 2.9293, v: 0.001061 + 0.25 * (0.88578 - 0.001061) /*~0.222*/};
            const state_2 = { P: P_CONST, T: 140.21, x: null, s: 7.2293, v: 0.98 /* approx interpolated */ };

            const layout_pv = { ...commonLayout, title: 'Q2: P-v Diagram (H₂O, Const P)', yaxis: {title: 'P(kPa)', range: [150, 250]}};
             layout_pv.xaxis.range = [0, 1.1];
            Plotly.newPlot('q2-pv-diagram', [
                getDomeTrace('v', 'P'),
                getStateTrace(state_1.v, state_1.P, '1'),
                getStateTrace(state_2.v, state_2.P, '2'),
                getProcessTrace([state_1.v, state_2.v], [state_1.P, state_2.P])
            ], layout_pv);

             const layout_ts = { ...commonLayoutTs, title: 'Q2: T-s Diagram (H₂O, Const P)', yaxis: {title: `T(${T_UNIT})`}};
             layout_ts.xaxis.range = [1.5, 8];
             layout_ts.yaxis.range = [100, 160]; // °C Range
             const sat_g_state = { s: 7.1268, T: 120.21 }; // Sat Vap point at 200 kPa
            Plotly.newPlot('q2-ts-diagram', [
                getDomeTrace('s', 'T'),
                getStateTrace(state_1.s, state_1.T, '1'),
                getStateTrace(state_2.s, state_2.T, '2'),
                 // Show boiling then superheating path
                 getProcessTrace([state_1.s, sat_g_state.s, state_2.s], [state_1.T, sat_g_state.T, state_2.T], 'curve')
             ], layout_ts);
        }

        function plotQ3() {
            if (!document.getElementById('q3-ts-diagram')) return;
            const T_UNIT = 'K';
            const T_H = 60 + 273.15;
            const T_L = -20 + 273.15;
            const state_1 = { s: 1.8529, T: T_H };
            const state_2 = { s: 4.8492, T: T_H };
            const state_3 = { s: state_2.s, T: T_L };
            const state_4 = { s: state_1.s, T: T_L };

             const layout_ts = { ...commonLayoutTs, title: 'Q3: T-s Diagram (Ammonia Carnot)', yaxis: {title: `T(${T_UNIT})`}};
             layout_ts.xaxis.range = [1.5, 5.2];
             layout_ts.yaxis.range = [240, 350];
             Plotly.newPlot('q3-ts-diagram', [
                getDomeTrace('s', 'T'),
                getStateTrace(state_1.s, state_1.T, '1'),
                getStateTrace(state_2.s, state_2.T, '2'),
                getStateTrace(state_3.s, state_3.T, '3'),
                getStateTrace(state_4.s, state_4.T, '4'),
                getProcessTrace([state_1.s, state_2.s], [state_1.T, state_2.T]),
                getProcessTrace([state_2.s, state_3.s], [state_2.T, state_3.T]),
                getProcessTrace([state_3.s, state_4.s], [state_3.T, state_4.T]),
                getProcessTrace([state_4.s, state_1.s], [state_4.T, state_1.T])
            ], layout_ts);
        }

         function plotQ4() {
             if (!document.getElementById('q4-pv-diagram')) return;
             const T = 125; // C
             const P = 232.2; // kPa
             const T_K = T + 273.15;
             const state_1 = { v: 0.001065, P: P, s: 1.5784, T: T };
             const state_2 = { v: 0.77011, P: P, s: 7.1907, T: T };

             const layout_pv = { ...commonLayout, title: 'Q4: P-v Diagram (H₂O Boiling)', yaxis: {title: 'P(kPa)', range: [200, 260]}};
             layout_pv.xaxis.range = [0, 0.85];
             Plotly.newPlot('q4-pv-diagram', [
                getDomeTrace('v', 'P'),
                getStateTrace(state_1.v, state_1.P, '1'),
                getStateTrace(state_2.v, state_2.P, '2'),
                getProcessTrace([state_1.v, state_2.v], [state_1.P, state_2.P])
            ], layout_pv);

             const layout_ts = { ...commonLayoutTs, title: 'Q4: T-s Diagram (H₂O Boiling)', yaxis: {title: `T(°C)`}}; // Using °C here
             layout_ts.xaxis.range = [1, 8];
             layout_ts.yaxis.range = [115, 135]; // Range around 125°C
            Plotly.newPlot('q4-ts-diagram', [
                getDomeTrace('s', 'T'),
                getStateTrace(state_1.s, state_1.T, '1'),
                getStateTrace(state_2.s, state_2.T, '2'),
                getProcessTrace([state_1.s, state_2.s], [state_1.T, state_2.T])
             ], layout_ts);
         }

        function plotQ5() {
             if (!document.getElementById('q5-pv-diagram')) return;
             const T = 200; // °C
             const T_K = T + 273.15;
             const state_1 = { P: 10000, T: T, v: 0.001148, s: 2.3178 }; // CL
             const state_2 = { P: 200,   T: T, v: 1.08049,  s: 7.5066 }; // SH

             const layout_pv = { ...commonLayout, title: 'Q5: P-v Diagram (H₂O Isothermal Exp)', yaxis: {title: 'P(kPa)', type: 'log'}};
             layout_pv.xaxis.range = [-0.1, 1.2];
             layout_pv.yaxis.range = [Math.log10(100), Math.log10(12000)];
             Plotly.newPlot('q5-pv-diagram', [
                 getDomeTrace('v', 'P'), // Illustrative dome
                 getStateTrace(state_1.v, state_1.P, '1 (CL)'),
                 getStateTrace(state_2.v, state_2.P, '2 (SH)'),
                 // Simple curve between points for isotherm visualization
                  getProcessTrace([state_1.v, state_1.v * 1.1, (state_1.v+state_2.v)/2, state_2.v * 0.9, state_2.v], // Sample v points
                                   [state_1.P, 1555, 1555, 500, state_2.P], // Approximate P drop including sat line
                                   'curve')
             ], layout_pv);

             const layout_ts = { ...commonLayoutTs, title: 'Q5: T-s Diagram (H₂O Isothermal Exp)', yaxis: {title: `T(°C)`}};
             layout_ts.xaxis.range = [2, 8];
             layout_ts.yaxis.range = [190, 210]; // Range around 200°C
            Plotly.newPlot('q5-ts-diagram', [
                getDomeTrace('s', 'T'),
                getStateTrace(state_1.s, T, '1 (CL)'),
                getStateTrace(state_2.s, T, '2 (SH)'),
                getProcessTrace([state_1.s, state_2.s], [T, T])
            ], layout_ts);
        }

        function plotQ11() {
             if (!document.getElementById('q11-pv-diagram')) return;
             const state_1 = { P: 190.08, v: 0.001504 }; // Sat Liq
             const state_2 = { P: 800, v: 0.19665 }; // SH

             const layout_pv = { ...commonLayout, title: 'Q11: P-v Diagram (Ammonia Spring)' };
             layout_pv.xaxis.range = [-0.01, 0.22];
             layout_pv.yaxis.range = [0, 900];
             Plotly.newPlot('q11-pv-diagram', [
                getDomeTrace('v', 'P'), // Illustrative ammonia dome
                getStateTrace(state_1.v, state_1.P, '1'),
                getStateTrace(state_2.v, state_2.P, '2'),
                getProcessTrace([state_1.v, state_2.v], [state_1.P, state_2.P]) // Straight line process
            ], layout_pv);
        }


        // --- Call Plotting Functions ---
        // Encapsulate calls in try/catch to prevent one error stopping others
        try { plotQ1(); } catch(e) { console.error("Plotting Q1 failed:", e); }
        try { plotQ2(); } catch(e) { console.error("Plotting Q2 failed:", e); }
        try { plotQ3(); } catch(e) { console.error("Plotting Q3 failed:", e); }
        try { plotQ4(); } catch(e) { console.error("Plotting Q4 failed:", e); }
        try { plotQ5(); } catch(e) { console.error("Plotting Q5 failed:", e); }
        // plotQ6() ... Q10 have no plots
        try { plotQ11(); } catch(e) { console.error("Plotting Q11 failed:", e); }
         // plotQ12() ... Q14 have no plots

     }, 100); // End setTimeout

});