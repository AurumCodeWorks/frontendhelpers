/* ═══════════════════════════════════════════════════════════
   FRAMEWORKS PAGE — Interactive logic
   Handles code updates, copying, syntax highlighting, live
   simulated previews, and the framework diagnostic quiz.
   ═══════════════════════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {

  const TASKS = {
    counter: {
      title: 'Counter Component (State & Events)',
      reactFile: 'Counter.jsx',
      angularFile: 'counter.component.ts',
      reactDesc: 'React uses <strong>hooks (useState)</strong> to handle local state. Re-rendering triggers the entire function to run again, recalculating variables.',
      angularDesc: 'Angular uses <strong>Signals</strong> (v16+) for fine-grained reactivity. Only the specific DOM node bound to the signal is updated when the state changes.',
      reactCode: `import React, { useState } from 'react';

export default function Counter() {
  // useState hook establishes reactive state
  const [count, setCount] = useState(0);

  return (
    <div className="counter-card">
      <p>Count: {count}</p>
      {/* State updates trigger component re-render */}
      <button onClick={() => setCount(count + 1)}>
        Increment
      </button>
    </div>
  );
}`,
      angularCode: `import { Component, signal } from '@angular/core';

@Component({
  selector: 'app-counter',
  standalone: true,
  template: \`
    <div class="counter-card">
      <!-- Read signal value by calling it like a function -->
      <p>Count: {{ count() }}</p>
      {/* Bind click event to increment method */}
      <button (click)="increment()">
        Increment
      </button>
    </div>
  \`
})
export class CounterComponent {
  // Fine-grained Signal state
  count = signal(0);

  increment() {
    // Update the signal value directly
    this.count.update(c => c + 1);
  }
}`
    },

    todo: {
      title: 'Dynamic Lists (Conditional & Loop Rendering)',
      reactFile: 'TodoList.jsx',
      angularFile: 'todo-list.component.ts',
      reactDesc: 'React relies on standard JavaScript arrays and expressions. We use <strong>Array.prototype.map</strong> to project data into JSX elements, requiring a unique <strong>key</strong> prop for DOM tracking.',
      angularDesc: 'Angular provides a built-in templating control flow. The modern <strong>@for</strong> loop (v17+) replaces *ngFor, featuring clean syntax, native performance optimizations, and an integrated <strong>@empty</strong> placeholder block.',
      reactCode: `import React, { useState } from 'react';

export default function TodoList() {
  const [todos, setTodos] = useState([
    { id: 1, text: 'Learn React' },
    { id: 2, text: 'Build an awesome application' }
  ]);

  return (
    <div className="todo-panel">
      <h3>React List</h3>
      {todos.length === 0 ? (
        <p>No tasks left!</p>
      ) : (
        <ul className="todo-list">
          {/* Loop over array using map */}
          {todos.map(todo => (
            <li key={todo.id}>{todo.text}</li>
          ))}
        </ul>
      )}
    </div>
  );
}`,
      angularCode: `import { Component, signal } from '@angular/core';

interface Todo {
  id: number;
  text: string;
}

@Component({
  selector: 'app-todo-list',
  standalone: true,
  template: \`
    <div class="todo-panel">
      <h3>Angular List</h3>
      <ul class="todo-list">
        <!-- Modern @for template loop (v17+) -->
        @for (todo of todos(); track todo.id) {
          <li>{{ todo.text }}</li>
        } @empty {
          <!-- Displayed if todos list is empty -->
          <li>No tasks left!</li>
        }
      </ul>
    </div>
  \`
})
export class TodoListComponent {
  todos = signal<Todo[]>([
    { id: 1, text: 'Learn Angular' },
    { id: 2, text: 'Build an awesome application' }
  ]);
}`
    },

    binding: {
      title: 'Two-Way Binding / Controlled Inputs',
      reactFile: 'InputForm.jsx',
      angularFile: 'input-form.component.ts',
      reactDesc: 'React achieves data binding through <strong>controlled components</strong>. You bind the \`value\` to state and updates flow manually via the \`onChange\` event handler.',
      angularDesc: 'Angular supports declarative two-way data binding. Using the <strong>[(ngModel)]</strong> banana-in-a-box syntax, Angular automatically synchronizes state between the input element and the controller.',
      reactCode: `import React, { useState } from 'react';

export default function InputForm() {
  const [name, setName] = useState('');

  return (
    <div className="form-container">
      {/* Controlled Input: value and change handler bound manually */}
      <input 
        type="text" 
        value={name} 
        onChange={(e) => setName(e.target.value)} 
        placeholder="Enter name"
      />
      <p>Hello, {name || 'stranger'}!</p>
    </div>
  );
}`,
      angularCode: `import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-input-form',
  standalone: true,
  imports: [FormsModule], // Required for ngModel
  template: \`
    <div class="form-container">
      <!-- Banana-in-a-box syntax for two-way synchronization -->
      <input 
        type="text" 
        [(ngModel)]="name" 
        placeholder="Enter name"
      />
      <p>Hello, {{ name() || 'stranger' }}!</p>
    </div>
  \`
})
export class InputFormComponent {
  name = signal('');
}
`
    },

    fetching: {
      title: 'Async Data Fetching & Side Effects',
      reactFile: 'Fetcher.jsx',
      angularFile: 'fetcher.component.ts',
      reactDesc: 'React handles fetching inside the <strong>useEffect</strong> hook. An AbortController should be used as a cleanup function to cancel outstanding requests if the component unmounts.',
      angularDesc: 'Angular uses the reactive <strong>rxResource</strong> or <strong>resource</strong> API (v18+) combined with the <strong>HttpClient</strong> to automatically trigger, track, and state-map asynchronous network calls.',
      reactCode: `import React, { useState, useEffect } from 'react';

export default function UserList() {
  const [users, setUsers] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const controller = new AbortController();

    fetch('https://api.example.com/users', { signal: controller.signal })
      .then(res => {
        if (!res.ok) throw new Error('Network response failed');
        return res.json();
      })
      .then(data => {
        setUsers(data);
        setLoading(false);
      })
      .catch(err => {
        if (err.name !== 'AbortError') {
          setError(err.message);
          setLoading(false);
        }
      });

    // Cleanup: cancels request if component updates/unmounts
    return () => controller.abort();
  }, []);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <ul>
      {users.map(u => <li key={u.id}>{u.name}</li>)}
    </ul>
  );
}`,
      angularCode: `import { Component, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { rxResource } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-user-list',
  standalone: true,
  template: \`
    <div class="user-panel">
      <!-- Modern template conditional blocks -->
      @if (userResource.isLoading()) {
        <p>Loading...</p>
      } @else if (userResource.error()) {
        <p>Error: {{ userResource.error() }}</p>
      } @else if (userResource.value(); as users) {
        <ul>
          @for (user of users; track user.id) {
            <li>{{ user.name }}</li>
          }
        </ul>
      }
    </div>
  \`
})
export class UserListComponent {
  private http = inject(HttpClient);

  // rxResource API (v18+) automatically handles async lifecycle
  userResource = rxResource({
    loader: () => this.http.get<any[]>('https://api.example.com/users')
  });
}`
    },

    communication: {
      title: 'Component Communication (Props & Outputs)',
      reactFile: 'ParentChild.jsx',
      angularFile: 'parent-child.component.ts',
      reactDesc: 'React component communication flows strictly downwards via props. To send data back up, the parent passes a **callback function** as a prop which the child executes.',
      angularDesc: 'Angular uses inputs and outputs. Standalone components declare inputs using the **`input()`** signal API and trigger parent events using the **`output()`** method API.',
      reactCode: `import React, { useState } from 'react';

// Child Component receiving data and a trigger function
function ChildComponent({ message, onNotify }) {
  return (
    <div className="child-card">
      <p>Received: {message}</p>
      <button onClick={() => onNotify('Hello from Child!')}>
        Notify Parent
      </button>
    </div>
  );
}

// Parent Component
export default function ParentComponent() {
  const [notification, setNotification] = useState('None');
  
  return (
    <div className="parent-card">
      <h3>Parent Component</h3>
      <p>Notification: {notification}</p>
      <ChildComponent 
        message="Hello from Parent!" 
        onNotify={(msg) => setNotification(msg)} 
      />
    </div>
  );
}`,
      angularCode: `import { Component, signal, input, output } from '@angular/core';

// Child Component
@Component({
  selector: 'app-child',
  standalone: true,
  template: \`
    <div class="child-card">
      <p>Received: {{ message() }}</p>
      <button (click)="notifyParent()">Notify Parent</button>
    </div>
  \`
})
export class ChildComponent {
  // Define Signal-based Input parameter (v17.3+)
  message = input<string>('');
  // Declare Output emitter
  notify = output<string>();

  notifyParent() {
    this.notify.emit('Hello from Child!');
  }
}

// Parent Component
@Component({
  selector: 'app-parent',
  standalone: true,
  imports: [ChildComponent],
  template: \`
    <div class="parent-card">
      <h3>Parent Component</h3>
      <p>Notification: {{ notification() }}</p>
      <app-child 
        [message]="'Hello from Parent!'" 
        (notify)="handleNotification($event)"
      />
    </div>
  \`
})
export class ParentComponent {
  notification = signal('None');

  handleNotification(msg: string) {
    this.notification.set(msg);
  }
}`
    },

    sharedState: {
      title: 'Shared Global State Management',
      reactFile: 'StateContext.jsx',
      angularFile: 'state.service.ts',
      reactDesc: 'React shares state using the **Context API**. A context provider component wraps the tree, and children hook into it using `useContext` to avoid "prop drilling".',
      angularDesc: 'Angular uses **Dependency Injection (DI)** with singleton services. A shared service class houses the Signal state, and components inject the service to access and mutate that value.',
      reactCode: `import React, { createContext, useContext, useState } from 'react';

const CountContext = createContext(null);

// Provider Component
export function CountProvider({ children }) {
  const [count, setCount] = useState(0);
  return (
    <CountContext.Provider value={{ count, setCount }}>
      {children}
    </CountContext.Provider>
  );
}

// Child Widget
export default function Widget() {
  const { count, setCount } = useContext(CountContext);
  return (
    <div className="widget">
      <p>Count: {count}</p>
      <button onClick={() => setCount(c => c + 1)}>Increment</button>
    </div>
  );
}`,
      angularCode: `import { Injectable, signal } from '@angular/core';

// Shared Injectable Service (Singleton)
@Injectable({
  providedIn: 'root'
})
export class SharedStateService {
  private countSignal = signal(0);
  // Read-only public reference
  count = this.countSignal.asReadonly();

  increment() {
    this.countSignal.update(c => c + 1);
  }
}

// Component
import { Component, inject } from '@angular/core';
@Component({
  selector: 'app-widget',
  standalone: true,
  template: \`
    <div class="widget">
      <p>Count: {{ state.count() }}</p>
      <button (click)="state.increment()">Increment</button>
    </div>
  \`
})
export class WidgetComponent {
  // Inject the shared state service
  state = inject(SharedStateService);
}`
    },

    validation: {
      title: 'Form Validation',
      reactFile: 'ValidatedForm.jsx',
      angularFile: 'validated-form.component.ts',
      reactDesc: 'React forms require manual value and error tracking in local state. Validation rules are checked inside change handlers or during form submission.',
      angularDesc: 'Angular uses **Reactive Forms** built-in libraries. You define a controller group in TypeScript class and link validation directives declaratively inside templates.',
      reactCode: `import React, { useState } from 'react';

export default function ValidatedForm() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email.includes('@')) {
      setError('Invalid email address');
    } else {
      setError('');
      alert('Form submitted successfully!');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input 
        type="email" 
        value={email}
        onChange={(e) => setEmail(e.target.value)} 
        placeholder="Enter email"
      />
      {error && <span className="error">{error}</span>}
      <button type="submit">Submit</button>
    </form>
  );
}`,
      angularCode: `import { Component } from '@angular/core';
import { FormControl, Validators, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-validated-form',
  standalone: true,
  imports: [ReactiveFormsModule],
  template: \`
    <form (ngSubmit)="onSubmit()">
      <input 
        type="email" 
        [formControl]="emailControl" 
        placeholder="Enter email"
      />
      <!-- Declaratively read validation status -->
      @if (emailControl.touched && emailControl.invalid) {
        <span class="error">Invalid email address</span>
      }
      <button type="submit" [disabled]="emailControl.invalid">Submit</button>
    </form>
  \`
})
export class ValidatedFormComponent {
  // Set up form control with validation rules
  emailControl = new FormControl('', [Validators.required, Validators.email]);

  onSubmit() {
    if (this.emailControl.valid) {
      alert('Form submitted successfully!');
    }
  }
}`
    },

    routing: {
      title: 'Dynamic Routing',
      reactFile: 'UserDetail.jsx',
      angularFile: 'user-detail.component.ts',
      reactDesc: 'React routing parses path wildcards via external hooks. In React Router, the `useParams()` hook retrieves variables (like `:id`) from the active URL path.',
      angularDesc: 'Angular Router maps dynamic parameters directly to component inputs. By enabling route parameter binding, the URL variable automatically updates a signal input field.',
      reactCode: `import React from 'react';
import { useParams } from 'react-router-dom';

export default function UserDetail() {
  // Access dynamic URL parameter: /users/:id
  const { id } = useParams();

  return (
    <div className="user-detail">
      <h4>User Record</h4>
      <p>Viewing profile for User ID: {id}</p>
    </div>
  );
}`,
      angularCode: `import { Component, input } from '@angular/core';

@Component({
  selector: 'app-user-detail',
  standalone: true,
  template: \`
    <div class="user-detail">
      <h4>User Record</h4>
      <!-- Automatically bound routing variable -->
      <p>Viewing profile for User ID: {{ id() }}</p>
    </div>
  \`
})
export class UserDetailComponent {
  // Route parameter automatically bound to this signal input
  id = input<string>('');
}`
    }
  };

  /* ── SYNTAX HIGHLIGHTER (single-pass tokenizer) ──────────── */
  const TOKEN_RE = /(\/\/[^\n]*|\/\*[\s\S]*?\*\/|<!--[\s\S]*?-->)|(`(?:\\[\s\S]|[^\\`])*`|'(?:\\.|[^'\\\n])*'|"(?:\\.|[^"\\\n])*")|\b(async|await|break|case|catch|class|const|continue|default|delete|else|export|extends|finally|for|from|function|if|import|in|instanceof|let|new|of|return|static|switch|throw|try|typeof|var|void|while|yield|standalone|inject|computed|resource)\b|(@defer|@if|@else|@for|@empty|placeholder|track)|(\{\{[^}]*\}\})|\b(true|false|null|undefined|this|super|NaN|Infinity)\b|\b(useState|useEffect|useMemo|useCallback|signal|rxResource|HttpClient)\b|\b(0x[\da-fA-F]+|\d+(?:\.\d+)?)\b/g;

  function escapeHtml(str) {
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  function highlight(code) {
    return escapeHtml(code).replace(TOKEN_RE, (match, comment, string, keyword, controlFlow, expression, literal, hooks, number) => {
      if (comment) return '<span class="tok-comment">' + comment + '</span>';
      if (string)  return '<span class="tok-string">' + string + '</span>';
      if (keyword) return '<span class="tok-keyword">' + keyword + '</span>';
      if (controlFlow) return '<span class="tok-keyword">' + controlFlow + '</span>';
      if (expression) return '<span class="tok-entity">' + expression + '</span>';
      if (literal) return '<span class="tok-literal">' + literal + '</span>';
      if (hooks) return '<span class="tok-type">' + hooks + '</span>';
      if (number)  return '<span class="tok-number">' + number + '</span>';
      return match;
    });
  }

  /* ── INTERACTION HANDLERS ────────────────────────────────── */
  const dropdownToggle = document.getElementById('dropdown-toggle');
  const dropdownMenu = document.getElementById('dropdown-menu');
  const dropdownVal = document.getElementById('dropdown-val');
  
  const reactFileName = document.getElementById('react-file-name');
  const angularFileName = document.getElementById('angular-file-name');
  
  const reactCodeBlock = document.getElementById('react-code');
  const angularCodeBlock = document.getElementById('angular-code');
  
  const reactDescBlock = document.getElementById('react-desc');
  const angularDescBlock = document.getElementById('angular-desc');
  
  const btnCopyReact = document.getElementById('btn-copy-react');
  const btnCopyAngular = document.getElementById('btn-copy-angular');

  const previewViewport = document.getElementById('sandbox-preview');

  let currentTaskKey = 'counter';

  /* ── LIVE SIMULATED PREVIEWS ENGINE ──────────────────────── */
  // Holds state of the running simulations
  const previewState = {
    count: 0,
    todos: [
      { id: 1, text: 'Learn React' },
      { id: 2, text: 'Build an awesome application' }
    ],
    inputValue: '',
    usersList: null,
    fetchLoading: false,
    fetchError: null,
    parentNotification: 'None',
    sharedCount: 0,
    email: '',
    password: '',
    emailTouched: false,
    formSubmitted: false,
    routingUserId: 1
  };

  const usersMockDatabase = [
    { id: 1, name: 'Ada Lovelace' },
    { id: 2, name: 'Alan Turing' },
    { id: 3, name: 'Grace Hopper' }
  ];

  function renderPreview() {
    previewViewport.innerHTML = '';
    const wrapper = document.createElement('div');
    wrapper.className = 'widget-box';

    switch (currentTaskKey) {
      case 'counter':
        wrapper.innerHTML = `
          <h4>Counter Component</h4>
          <div class="widget-display" id="preview-count">${previewState.count}</div>
          <button class="widget-btn" id="btn-preview-increment">Increment count</button>
        `;
        wrapper.querySelector('#btn-preview-increment').addEventListener('click', () => {
          previewState.count++;
          renderPreview();
        });
        break;

      case 'todo':
        let itemsHtml = '';
        if (previewState.todos.length === 0) {
          itemsHtml = '<li class="todo-preview-item" style="color:var(--text-dim)">No tasks left!</li>';
        } else {
          previewState.todos.forEach(todo => {
            itemsHtml += `
              <li class="todo-preview-item">
                <span>${escapeHtml(todo.text)}</span>
                <button class="btn-delete-todo" data-id="${todo.id}">×</button>
              </li>
            `;
          });
        }

        wrapper.innerHTML = `
          <h4>Todo Checklist</h4>
          <div class="todo-preview-input-group">
            <input type="text" id="todo-input" class="preview-input" placeholder="What needs doing?" />
            <button class="widget-btn" id="btn-add-todo" style="padding: 8px 16px;">Add</button>
          </div>
          <ul class="todo-preview-list">
            ${itemsHtml}
          </ul>
        `;

        const addAction = () => {
          const inp = wrapper.querySelector('#todo-input');
          const txt = inp.value.trim();
          if (txt) {
            previewState.todos.push({ id: Date.now(), text: txt });
            inp.value = '';
            renderPreview();
          }
        };

        wrapper.querySelector('#btn-add-todo').addEventListener('click', addAction);
        wrapper.querySelector('#todo-input').addEventListener('keydown', (e) => {
          if (e.key === 'Enter') addAction();
        });

        wrapper.querySelectorAll('.btn-delete-todo').forEach(btn => {
          btn.addEventListener('click', () => {
            const tid = parseInt(btn.getAttribute('data-id'));
            previewState.todos = previewState.todos.filter(t => t.id !== tid);
            renderPreview();
          });
        });
        break;

      case 'binding':
        wrapper.innerHTML = `
          <h4>Two-Way Binding Input</h4>
          <input type="text" id="binding-input" class="preview-input" value="${escapeHtml(previewState.inputValue)}" placeholder="Type something..." style="width:100%;margin-bottom:10px" />
          <div class="avatar-preview-badge">
            Greeting output: Hello, <span id="binding-output" style="color:var(--secondary);font-weight:600">${escapeHtml(previewState.inputValue) || 'stranger'}</span>!
          </div>
        `;
        const bin = wrapper.querySelector('#binding-input');
        const bout = wrapper.querySelector('#binding-output');
        bin.addEventListener('input', (e) => {
          previewState.inputValue = e.target.value;
          bout.textContent = e.target.value || 'stranger';
        });
        break;

      case 'fetching':
        let contentHtml = '';
        if (previewState.fetchLoading) {
          contentHtml = `
            <div class="skeleton-loader">
              <div class="skeleton-line w-80"></div>
              <div class="skeleton-line w-60"></div>
              <div class="skeleton-line w-90"></div>
            </div>
          `;
        } else if (previewState.fetchError) {
          contentHtml = `<p class="validation-error-text" style="font-size:0.95rem">Error: ${previewState.fetchError}</p>`;
        } else if (previewState.usersList) {
          let rows = '';
          previewState.usersList.forEach(u => {
            rows += `
              <div class="user-item-preview">
                <span class="user-avatar-circle">${u.name.charAt(0)}</span>
                <span><strong>${escapeHtml(u.name)}</strong> (Mock API)</span>
              </div>
            `;
          });
          contentHtml = `<div class="user-list-wrapper">${rows}</div>`;
        } else {
          contentHtml = `<p style="color:var(--text-dim);font-size:0.88rem">Click a button below to load profiles...</p>`;
        }

        wrapper.innerHTML = `
          <h4>API Data Fetcher</h4>
          <div class="fetch-preview-content" style="min-height:110px;display:flex;flex-direction:column;justify-content:center">
            ${contentHtml}
          </div>
          <div class="btn-row">
            <button class="widget-btn" id="btn-fetch-success">Fetch Data</button>
            <button class="widget-btn btn-danger-preview" id="btn-fetch-fail">Trigger Error</button>
          </div>
        `;

        wrapper.querySelector('#btn-fetch-success').addEventListener('click', () => {
          if (previewState.fetchLoading) return;
          previewState.fetchLoading = true;
          previewState.fetchError = null;
          previewState.usersList = null;
          renderPreview();

          setTimeout(() => {
            previewState.fetchLoading = false;
            previewState.usersList = usersMockDatabase;
            renderPreview();
          }, 800);
        });

        wrapper.querySelector('#btn-fetch-fail').addEventListener('click', () => {
          if (previewState.fetchLoading) return;
          previewState.fetchLoading = true;
          previewState.fetchError = null;
          previewState.usersList = null;
          renderPreview();

          setTimeout(() => {
            previewState.fetchLoading = false;
            previewState.fetchError = 'Simulated connection timeout (504)';
            renderPreview();
          }, 800);
        });
        break;

      case 'communication':
        wrapper.innerHTML = `
          <h4>Component Node Tree</h4>
          <div class="comm-layout">
            <div class="comm-node parent">
              <span style="font-size:0.75rem;color:var(--primary);font-weight:700">PARENT NODE</span>
              <p style="font-size:0.9rem;margin-top:4px">Notification: <strong style="color:var(--secondary)">${escapeHtml(previewState.parentNotification)}</strong></p>
            </div>
            <div class="comm-node child">
              <span style="font-size:0.75rem;color:var(--secondary);font-weight:700">CHILD COMPONENT</span>
              <p style="font-size:0.85rem;color:var(--text-dim);margin:6px 0">Receives message: "Hello from Parent!"</p>
              <button class="widget-btn" id="btn-trigger-output" style="padding: 6px 14px; font-size:0.8rem">Trigger Output Event</button>
            </div>
          </div>
        `;
        wrapper.querySelector('#btn-trigger-output').addEventListener('click', () => {
          previewState.parentNotification = 'Hello from Child!';
          renderPreview();
        });
        break;

      case 'sharedState':
        wrapper.innerHTML = `
          <h4>Shared State Service</h4>
          <div class="dashboard-grid">
            <div class="dashboard-widget">
              <span style="font-size:0.75rem;color:var(--secondary);font-weight:700">WIDGET A</span>
              <p style="margin:8px 0;font-size:1.1rem;font-weight:600">${previewState.sharedCount}</p>
              <button class="widget-btn" id="btn-widget-a" style="padding: 4px 10px; font-size:0.75rem">Increment A</button>
            </div>
            <div class="dashboard-widget">
              <span style="font-size:0.75rem;color:var(--primary);font-weight:700">WIDGET B</span>
              <p style="margin:8px 0;font-size:1.1rem;font-weight:600">${previewState.sharedCount}</p>
              <button class="widget-btn" id="btn-widget-b" style="padding: 4px 10px; font-size:0.75rem">Increment B</button>
            </div>
          </div>
          <p style="font-size:0.8rem;color:var(--text-dim);margin-top:10px">Both components inject the same service singleton. Updating one syncs the other.</p>
        `;
        const incShared = () => {
          previewState.sharedCount++;
          renderPreview();
        };
        wrapper.querySelector('#btn-widget-a').addEventListener('click', incShared);
        wrapper.querySelector('#btn-widget-b').addEventListener('click', incShared);
        break;

      case 'validation':
        wrapper.innerHTML = `
          <h4>Reactive Form Validation</h4>
          <form id="preview-form" class="validation-form" onsubmit="return false;">
            <div style="display:flex;flex-direction:column">
              <label for="val-email">Email Address</label>
              <input type="text" id="val-email" class="preview-input" value="${escapeHtml(previewState.email)}" placeholder="e.g. user@domain.com" />
              <div id="val-email-msg"></div>
            </div>
            <div style="display:flex;flex-direction:column;margin-top:4px">
              <label for="val-pass">Password</label>
              <input type="password" id="val-pass" class="preview-input" value="${escapeHtml(previewState.password)}" placeholder="••••••" />
              <div id="val-pass-msg"></div>
            </div>
            <button class="widget-btn" id="btn-val-submit" type="submit" style="margin-top:6px" disabled>Submit Form</button>
          </form>
          <div id="val-submit-feedback"></div>
        `;

        const emInput = wrapper.querySelector('#val-email');
        const paInput = wrapper.querySelector('#val-pass');
        const emMsg = wrapper.querySelector('#val-email-msg');
        const paMsg = wrapper.querySelector('#val-pass-msg');
        const subBtn = wrapper.querySelector('#btn-val-submit');
        const feedback = wrapper.querySelector('#val-submit-feedback');

        const validateForm = () => {
          const emailVal = emInput.value;
          const passVal = paInput.value;
          const emailValid = emailVal.includes('@');
          const passValid = passVal.length >= 6;
          const formValid = emailValid && passValid;

          if (previewState.emailTouched) {
            emMsg.innerHTML = emailValid 
              ? '<span class="validation-success-text">✓ Format correct</span>' 
              : '<span class="validation-error-text">✗ Requires an "@" symbol</span>';
          } else {
            emMsg.innerHTML = '';
          }

          if (passVal.length > 0) {
            paMsg.innerHTML = passValid 
              ? '<span class="validation-success-text">✓ Strong password</span>' 
              : '<span class="validation-error-text">✗ Needs at least 6 characters</span>';
          } else {
            paMsg.innerHTML = '';
          }

          subBtn.disabled = !formValid;

          if (previewState.formSubmitted) {
            feedback.innerHTML = '<div class="validation-success-text" style="text-align:center;font-weight:600;font-size:0.9rem;margin-top:10px">Form submitted successfully!</div>';
          } else {
            feedback.innerHTML = '';
          }
        };

        emInput.addEventListener('input', (e) => {
          previewState.email = e.target.value;
          previewState.emailTouched = true;
          previewState.formSubmitted = false;
          validateForm();
        });

        paInput.addEventListener('input', (e) => {
          previewState.password = e.target.value;
          previewState.formSubmitted = false;
          validateForm();
        });

        wrapper.querySelector('#preview-form').addEventListener('submit', (e) => {
          e.preventDefault();
          const emailValid = emInput.value.includes('@');
          const passValid = paInput.value.length >= 6;
          if (emailValid && passValid) {
            previewState.formSubmitted = true;
            validateForm();
          }
        });

        // Initialize state indicators
        validateForm();
        break;

      case 'routing':
        const activeUser = usersMockDatabase.find(u => u.id === previewState.routingUserId) || { name: 'Unknown User' };

        wrapper.innerHTML = `
          <h4>Dynamic Router simulation</h4>
          <div class="routing-address-bar">
            <span>https://frontendhelpers.com/users/</span>
            <span class="address-input-value" id="address-param">${previewState.routingUserId}</span>
          </div>
          <div style="background:rgba(0,0,0,0.4);border:1px solid var(--border);border-radius:6px;padding:12px;text-align:left">
            <span style="font-size:0.75rem;color:var(--secondary);font-weight:700">USER PROFILE CONTAINER</span>
            <p style="font-size:0.95rem;margin-top:6px;font-weight:600">${escapeHtml(activeUser.name)}</p>
            <p style="font-size:0.8rem;color:var(--text-dim)">Dynamic parameters mapping outputs profile data.</p>
          </div>
          <div class="btn-row" style="margin-top:14px">
            <button class="widget-btn" id="btn-route-prev" style="padding: 6px 14px">Previous User</button>
            <button class="widget-btn" id="btn-route-next" style="padding: 6px 14px">Next User</button>
          </div>
        `;

        wrapper.querySelector('#btn-route-prev').addEventListener('click', () => {
          if (previewState.routingUserId > 1) {
            previewState.routingUserId--;
            renderPreview();
          }
        });

        wrapper.querySelector('#btn-route-next').addEventListener('click', () => {
          if (previewState.routingUserId < usersMockDatabase.length) {
            previewState.routingUserId++;
            renderPreview();
          }
        });
        break;
    }

    previewViewport.appendChild(wrapper);
  }

  function updateSandbox() {
    const taskData = TASKS[currentTaskKey];
    if (!taskData) return;

    // Update file names
    reactFileName.textContent = taskData.reactFile;
    angularFileName.textContent = taskData.angularFile;

    // Update code content with highlighting
    reactCodeBlock.innerHTML = `<code>${highlight(taskData.reactCode)}</code>`;
    angularCodeBlock.innerHTML = `<code>${highlight(taskData.angularCode)}</code>`;

    // Update documentation explanations
    reactDescBlock.innerHTML = taskData.reactDesc;
    angularDescBlock.innerHTML = taskData.angularDesc;

    // Trigger simulation render
    renderPreview();
  }

  // Custom Dropdown Interactivity
  if (dropdownToggle && dropdownMenu) {
    dropdownToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      const show = dropdownMenu.classList.toggle('show');
      dropdownToggle.classList.toggle('active', show);
      dropdownToggle.setAttribute('aria-expanded', String(show));
    });

    document.addEventListener('click', () => {
      dropdownMenu.classList.remove('show');
      dropdownToggle.classList.remove('active');
      dropdownToggle.setAttribute('aria-expanded', 'false');
    });

    // Escape closes and returns focus to the trigger, matching the
    // other dropdowns on the site
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && dropdownMenu.classList.contains('show')) {
        dropdownMenu.classList.remove('show');
        dropdownToggle.classList.remove('active');
        dropdownToggle.setAttribute('aria-expanded', 'false');
        dropdownToggle.focus();
      }
    });

    dropdownMenu.querySelectorAll('.dropdown-option').forEach(option => {
      option.addEventListener('click', () => {
        dropdownMenu.querySelectorAll('.dropdown-option').forEach(opt => opt.classList.remove('active'));
        option.classList.add('active');
        dropdownVal.textContent = option.textContent;
        currentTaskKey = option.getAttribute('data-value');
        updateSandbox();

        const sandboxSection = document.querySelector('.sandbox-section');
        if (sandboxSection) {
          sandboxSection.scrollIntoView({ behavior: 'smooth' });
        }
      });
    });
  }

  // Copy code buttons
  if (btnCopyReact) {
    btnCopyReact.addEventListener('click', () => {
      const codeText = TASKS[currentTaskKey].reactCode;
      if (typeof copyToClipboard === 'function') {
        copyToClipboard(codeText, 'React code');
      } else {
        navigator.clipboard.writeText(codeText).then(() => alert('React code copied to clipboard'));
      }
    });
  }

  if (btnCopyAngular) {
    btnCopyAngular.addEventListener('click', () => {
      const codeText = TASKS[currentTaskKey].angularCode;
      if (typeof copyToClipboard === 'function') {
        copyToClipboard(codeText, 'Angular code');
      } else {
        navigator.clipboard.writeText(codeText).then(() => alert('Angular code copied to clipboard'));
      }
    });
  }

  /* ── DIAGNOSTIC QUIZ SYSTEM ──────────────────────────────── */
  const quizForm = document.getElementById('quiz-form');
  const quizResults = document.getElementById('quiz-results');
  const reactPercentage = document.getElementById('react-percentage');
  const angularPercentage = document.getElementById('angular-percentage');
  const reactBar = document.getElementById('react-bar');
  const angularBar = document.getElementById('angular-bar');
  const quizVerdictSummary = document.getElementById('quiz-verdict-summary');
  const btnResetQuiz = document.getElementById('btn-reset-quiz');

  if (quizForm) {
    quizForm.addEventListener('submit', (e) => {
      e.preventDefault();

      let reactScore = 0;
      let angularScore = 0;

      // Extract form answers
      const formData = new FormData(quizForm);
      for (const value of formData.values()) {
        if (value === 'react') {
          reactScore += 20;
        } else if (value === 'angular') {
          angularScore += 20;
        }
      }

      // Render percentage text
      reactPercentage.textContent = `${reactScore}%`;
      angularPercentage.textContent = `${angularScore}%`;

      // Animate progress bars
      reactBar.style.width = `${reactScore}%`;
      angularBar.style.width = `${angularScore}%`;

      // Compute Verdict Text
      let verdict = '';
      if (reactScore > angularScore) {
        verdict = `<strong>Verdict: React is your optimal fit (${reactScore}% match)!</strong> You value customization, modularity, and rapid prototyping. React allows your team to compose interfaces quickly using standard JavaScript paradigms (JSX) without being locked into strict architectural guidelines.`;
      } else if (angularScore > reactScore) {
        verdict = `<strong>Verdict: Angular is your optimal fit (${angularScore}% match)!</strong> You prioritize consistency, strict typing, and structured framework rules. Angular's batteries-included approach is ideal for managing long-term, scale enterprise products where developers benefit from a standard router, forms validator, and reactive Signals.`;
      } else {
        verdict = `<strong>Verdict: You are evenly split (50/50 match)!</strong> Your project could benefit from either framework. We recommend starting with <strong>React</strong> to master basic component flow, and then exploring <strong>Angular</strong> when you require built-in enterprise features and strict consistency.`;
      }
      quizVerdictSummary.innerHTML = verdict;

      // Display results panel
      quizResults.hidden = false;
      
      // Smooth scroll to results
      quizResults.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    });
  }

  if (btnResetQuiz) {
    btnResetQuiz.addEventListener('click', () => {
      quizForm.reset();
      quizResults.hidden = true;
      document.getElementById('frameworks-quiz').scrollIntoView({ behavior: 'smooth' });
    });
  }

  // Initialize sandbox on first load
  updateSandbox();
  
  if (typeof initStickyToolbar === 'function') {
    const toolbar = document.querySelector('.tools-toolbar');
    if (toolbar) initStickyToolbar(toolbar);
  }
});
