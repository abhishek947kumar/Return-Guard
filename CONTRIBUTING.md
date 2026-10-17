# Contributing to ReturnGuard 🛡️

Thank you for your interest in contributing to **ReturnGuard**! We welcome contributions to enhance our autonomous ReAct reasoning algorithms, policy matrix evaluations, computer vision analysis, and UI components.

---

## 🛠️ Development Setup

1. **Fork and Clone the Repository**
   ```bash
   git clone https://github.com/your-username/return-guard.git
   cd return-guard
   ```

2. **Backend Setup (Python)**
   ```bash
   # Create a virtual environment
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate

   # Install dependencies
   pip install -r requirements.txt

   # Run FastAPI server
   python -m uvicorn backend.app.main:app --host 127.0.0.1 --port 8000 --reload
   ```

3. **Frontend Setup (React + Vite)**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

---

## 🧪 Testing Your Changes

* Run backend unit and ReAct loop tests:
  ```bash
  python -c "from backend.app.agent.react_agent import agent_instance; print(agent_instance.process_request('AirPods glitching', 'ORD-7821').trace.final_resolution)"
  ```
* Verify frontend builds cleanly:
  ```bash
  cd frontend
  npm run build
  ```

---

## 📋 Pull Request Guidelines

1. **Create a Feature Branch:** `git checkout -b feature/your-feature-name`
2. **Follow Code Conventions:**
   - Python: Follow PEP 8 style, use Pydantic models for request/response validation.
   - Frontend: Vanilla CSS with custom properties in `index.css`; keep components modular.
3. **Commit Messages:** Use clear, conventional commit messages:
   - `feat: add multimodal visual defect inspection`
   - `fix: correct restocking fee calculation on heavy appliances`
   - `docs: update API documentation in README`
4. **Submit PR:** Open a Pull Request against the `main` branch with a clear description of your changes and test results.

---

## 📄 License
By contributing to ReturnGuard, you agree that your contributions will be licensed under the [MIT License](LICENSE).
