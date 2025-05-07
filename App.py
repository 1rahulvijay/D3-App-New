from flask import Flask, render_template, jsonify

app = Flask(__name__)

# Sample data (replace with your data source, e.g., database)
SAMPLE_DATA = [
    {"label": "Jan", "value": 30, "unit": "K"},
    {"label": "Feb", "value": 70, "unit": "K"},
    {"label": "Mar", "value": 45, "unit": "K"},
    {"label": "Apr", "value": 85, "unit": "K"},
    {"label": "May", "value": 60, "unit": "K"}
]

SCATTER_DATA = [
    {"label": "Product A", "value": 50, "secondary": 20},
    {"label": "Product B", "value": 70, "secondary": 30},
    {"label": "Product C", "value": 40, "secondary": 25},
    {"label": "Product D", "value": 90, "secondary": 15},
    {"label": "Product E", "value": 60, "secondary": 35}
]

FUNNEL_DATA = [
    {"width": 100, "label": "Leads", "value": 1000},
    {"width": 80, "label": "Qualified", "value": 800},
    {"width": 60, "label": "Proposals", "value": 600},
    {"width": 40, "label": "Closed", "value": 400}
]

@app.route('/')
def index():
    # Render the dashboard template
    return render_template('index.html')

@app.route('/api/data')
def get_data():
    # Return data as JSON
    return jsonify({
        "sampleData": SAMPLE_DATA,
        "scatterData": SCATTER_DATA,
        "funnelData": FUNNEL_DATA,
        "radialData": [{"label": "Progress", "value": "70%", "unit": ""}],
        "gaugeData": [{"label": "KPI Score", "value": "85%", "unit": ""}]
    })

if __name__ == '__main__':
    app.run(debug=True)
