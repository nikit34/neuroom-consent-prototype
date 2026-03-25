import {
  createContext,
  useContext,
  useEffect,
  useReducer,
  useState,
  type Dispatch
} from "react";
import { NavLink, Route, Routes, useLocation, useNavigate } from "react-router-dom";

type ConsentStatus =
  | "grace_active_not_sent"
  | "grace_active_sent"
  | "grace_expired"
  | "confirmed";

type DemoState = {
  status: ConsentStatus;
  daysLeft: number;
  startedAt: string;
  lastLinkSentAt: string | null;
  sendCount: number;
  parentName: string | null;
  homeworkSubmitted: boolean;
};

type DemoAction =
  | { type: "SEND_LINK" }
  | { type: "ADVANCE_DAY" }
  | { type: "CONFIRM_PARENT" }
  | { type: "RESET" }
  | { type: "SUBMIT_HOMEWORK" }
  | { type: "SET_STATUS"; status: ConsentStatus };

type HomeworkVariant = "deadline" | "debt" | "waiting" | "score" | "problems";

type HomeworkCardItem = {
  id: string;
  title: string;
  subject: string;
  dueText: string;
  variant: HomeworkVariant;
  score?: string;
  tagText?: string;
};

type DemoContextValue = {
  state: DemoState;
  dispatch: Dispatch<DemoAction>;
};

const STORAGE_KEY = "neuroom-consent-prototype";

const assets = {
  navAssignment: "https://www.figma.com/api/mcp/asset/af4060e8-623d-4335-a82c-1cab8e70bca0",
  navSettings: "https://www.figma.com/api/mcp/asset/8e9d5567-e421-4575-8be4-6d36b5cb2054",
  navAvatar: "https://www.figma.com/api/mcp/asset/4332785c-5156-4e4e-859d-396f29ba5750",
  logoWordmark: "https://www.figma.com/api/mcp/asset/e9c975ab-1aa6-4673-ba89-94a22352cade",
  logoMark: "https://www.figma.com/api/mcp/asset/931d7ffa-f883-4f7f-bfec-1df9f80099ca",
  tagAlarm: "https://www.figma.com/api/mcp/asset/69d5f8e6-fd11-45b0-a45c-235bce9651f2",
  calendar: "https://www.figma.com/api/mcp/asset/5dc36136-94ed-40c7-8d18-cf503c13d8e9",
  attach: "https://www.figma.com/api/mcp/asset/0b059a3b-5e6c-4369-8789-5a06a1e6603d",
  chevron: "https://www.figma.com/api/mcp/asset/778e7c21-97e0-4a51-b22f-bd3d003f2fc4",
  bannerLogo: "https://www.figma.com/api/mcp/asset/a09598ca-f15f-40be-ba27-fd67e8b16331",
  backChevron: "https://www.figma.com/api/mcp/asset/0653a35e-4955-4cf3-9e0a-6b8ffd1d45a2",
  reviewBolt: "https://www.figma.com/api/mcp/asset/e5491c73-23c6-41a7-bd83-4fb035eb968e",
  buttonBolt: "https://www.figma.com/api/mcp/asset/013e0c99-813e-4dd3-b248-7f3bbb1ffdae",
  calendarOutline: "https://www.figma.com/api/mcp/asset/13468747-5a61-4fd3-b30d-4b88b043c272",
  detailPhoto: "https://www.figma.com/api/mcp/asset/e1e55dc3-0fcd-4983-bfa7-319a8eefaaba",
  detailExpand: "https://www.figma.com/api/mcp/asset/16c99053-2dc8-48f9-a8c6-ab07be8945ae",
  helpIcon: "https://www.figma.com/api/mcp/asset/cf6698da-1a6b-4fe1-9061-e0e34b161ec0",
  warningMain: "https://www.figma.com/api/mcp/asset/8bebf32b-67aa-4777-923b-0ccb0cd439c2",
  warningSmall: "https://www.figma.com/api/mcp/asset/7d152547-497b-4fe0-9427-b8ef0fda708e",
  problemPhoto1: "https://www.figma.com/api/mcp/asset/f1f9d2ae-54c6-4c44-9d30-1ac08fa13cf1",
  problemPhoto2: "https://www.figma.com/api/mcp/asset/75e27519-dc4d-4b58-b8bf-98e586bafda7",
  problemPhoto3: "https://www.figma.com/api/mcp/asset/6eebc43c-6e90-4573-a36c-af93ae896e3d",
  problemPhoto4: "https://www.figma.com/api/mcp/asset/31d6c93f-0c5a-4875-b1be-76a9a9d94813"
};

const initialState: DemoState = {
  status: "grace_active_not_sent",
  daysLeft: 7,
  startedAt: "24 марта 2026",
  lastLinkSentAt: null,
  sendCount: 0,
  parentName: null,
  homeworkSubmitted: false
};

const activeCards: HomeworkCardItem[] = [
  {
    id: "active-1",
    title: "стр. 20, задание 10, 11 и 12, ещё дополнительно можно сделать…",
    subject: "Математика",
    dueText: "Сдать до: 30 января",
    variant: "deadline",
    tagText: "Осталось 1 день"
  },
  {
    id: "active-2",
    title: "стр. 20, задание 10, 11 и 12, ещё дополнительно можно сделать…",
    subject: "Математика",
    dueText: "Сдать до: 30 января",
    variant: "deadline",
    tagText: "Осталось 3 дня"
  },
  {
    id: "active-3",
    title: "стр. 20, задание 10, 11 и 12, ещё дополнительно можно сделать…",
    subject: "Математика",
    dueText: "Сдать до: 30 января",
    variant: "deadline",
    tagText: "Осталось 4 дня"
  }
];

const debtCards: HomeworkCardItem[] = [
  {
    id: "debt-1",
    title: "стр. 20, задание 10, 11 и 12, ещё дополнительно можно сделать…",
    subject: "Математика",
    dueText: "Сдать до: 30 января",
    variant: "debt",
    tagText: "Долг"
  },
  {
    id: "debt-2",
    title: "стр. 20, задание 10, 11 и 12, ещё дополнительно можно сделать…",
    subject: "Математика",
    dueText: "Сдать до: 30 января",
    variant: "debt",
    tagText: "Долг"
  }
];

const submittedCards: HomeworkCardItem[] = [
  {
    id: "submitted-1",
    title: "стр. 20, задание 10, 11 и 12, ещё дополнительно можно сделать…",
    subject: "Математика",
    dueText: "Сдать до: 30 января",
    variant: "waiting",
    tagText: "На проверке"
  },
  {
    id: "submitted-2",
    title: "стр. 20, задание 10, 11 и 12, ещё дополнительно можно сделать…",
    subject: "Математика",
    dueText: "Сдать до: 30 января",
    variant: "score",
    tagText: "Твоя оценка",
    score: "5"
  },
  {
    id: "submitted-3",
    title: "стр. 20, задание 10, 11 и 12, ещё дополнительно можно сделать…",
    subject: "Математика",
    dueText: "Сдать до: 30 января",
    variant: "problems",
    tagText: "Нужно пересдать"
  },
  {
    id: "submitted-4",
    title: "стр. 20, задание 10, 11 и 12, ещё дополнительно можно сделать…",
    subject: "Математика",
    dueText: "Сдать до: 30 января",
    variant: "score",
    tagText: "Твоя оценка",
    score: "4"
  },
  {
    id: "submitted-5",
    title: "стр. 20, задание 10, 11 и 12, ещё дополнительно можно сделать…",
    subject: "Математика",
    dueText: "Сдать до: 30 января",
    variant: "score",
    tagText: "Твоя оценка",
    score: "2"
  },
  {
    id: "submitted-6",
    title: "стр. 20, задание 10, 11 и 12, ещё дополнительно можно сделать…",
    subject: "Математика",
    dueText: "Сдать до: 30 января",
    variant: "score",
    tagText: "Твоя оценка",
    score: "3"
  }
];

const DemoContext = createContext<DemoContextValue | null>(null);

function loadState(): DemoState {
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return initialState;
  }

  try {
    return JSON.parse(raw) as DemoState;
  } catch {
    return initialState;
  }
}

function clampState(next: DemoState): DemoState {
  if (next.status === "confirmed") {
    return {
      ...next,
      daysLeft: Math.max(next.daysLeft, 0)
    };
  }

  if (next.daysLeft <= 0) {
    return {
      ...next,
      status: "grace_expired",
      daysLeft: 0
    };
  }

  return next;
}

function reducer(state: DemoState, action: DemoAction): DemoState {
  switch (action.type) {
    case "SEND_LINK":
      return clampState({
        ...state,
        status: state.status === "grace_expired" ? "grace_expired" : "grace_active_sent",
        lastLinkSentAt: "сейчас",
        sendCount: state.sendCount + 1
      });
    case "ADVANCE_DAY":
      return clampState({
        ...state,
        daysLeft: state.status === "confirmed" ? state.daysLeft : state.daysLeft - 1
      });
    case "CONFIRM_PARENT":
      return {
        ...state,
        status: "confirmed",
        parentName: "Елена Викторовна",
        lastLinkSentAt: state.lastLinkSentAt ?? "1 день назад"
      };
    case "SUBMIT_HOMEWORK":
      return {
        ...state,
        homeworkSubmitted: true
      };
    case "SET_STATUS":
      if (action.status === "confirmed") {
        return {
          ...state,
          status: action.status,
          parentName: "Елена Викторовна"
        };
      }

      if (action.status === "grace_expired") {
        return {
          ...state,
          status: action.status,
          daysLeft: 0,
          parentName: null
        };
      }

      return {
        ...state,
        status: action.status,
        daysLeft: Math.max(state.daysLeft, 1),
        parentName: null
      };
    case "RESET":
      return initialState;
    default:
      return state;
  }
}

function useDemoState() {
  const ctx = useContext(DemoContext);
  if (!ctx) {
    throw new Error("DemoContext is not available");
  }

  return ctx;
}

function pageMeta(pathname: string) {
  if (pathname === "/profile") {
    return { title: "Настройки профиля", subtitle: null, filter: null };
  }

  if (pathname.startsWith("/parent/confirm")) {
    return { title: "Подтверждение согласия", subtitle: null, filter: null };
  }

  if (pathname.startsWith("/homework/42/send")) {
    return { title: "Просмотр задания", subtitle: "Математика", filter: null };
  }

  if (pathname.startsWith("/homework/42")) {
    return { title: "Просмотр задания", subtitle: "Математика", filter: null };
  }

  return { title: "Задания", subtitle: null, filter: "Математика" };
}

function statusLabel(status: ConsentStatus) {
  switch (status) {
    case "grace_active_not_sent":
      return "Ожидание";
    case "grace_active_sent":
      return "Ссылка отправлена";
    case "grace_expired":
      return "Время вышло";
    case "confirmed":
      return "Подтверждено";
    default:
      return status;
  }
}

const SHARE_URL = "https://neuroom.pw/register/parent/abc123token";

function App() {
  const [state, dispatch] = useReducer(reducer, undefined, loadState);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  return (
    <DemoContext.Provider value={{ state, dispatch }}>
      <PrototypeShell />
    </DemoContext.Provider>
  );
}

function PrototypeShell() {
  const location = useLocation();
  const navigate = useNavigate();
  const [shareOpen, setShareOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [labOpen, setLabOpen] = useState(false);
  const { state, dispatch } = useDemoState();

  useEffect(() => {
    if (!toast) {
      return;
    }

    const timer = window.setTimeout(() => setToast(null), 5000);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const meta = pageMeta(location.pathname);
  const showConsentBanner = !location.pathname.startsWith("/parent/confirm") && state.status !== "confirmed";

  async function handleQuickShare() {
    dispatch({ type: "SEND_LINK" });
    try {
      if (navigator.share) {
        await navigator.share({
          title: "Нейрум — согласие родителя",
          text: "Подтвердите согласие на использование Нейрум вашим ребёнком",
          url: SHARE_URL
        });
        setToast("Ссылка отправлена родителю.");
      } else {
        await navigator.clipboard.writeText(SHARE_URL);
        setToast("Ссылка скопирована. Перешли её родителю.");
      }
    } catch {
      await navigator.clipboard.writeText(SHARE_URL);
      setToast("Ссылка скопирована. Перешли её родителю.");
    }
  }

  function handleSendLink(method: "share" | "copy") {
    dispatch({ type: "SEND_LINK" });
    setShareOpen(false);
    setToast(
      method === "share"
        ? "Ссылка отправлена родителю."
        : "Ссылка скопирована. Перешли её родителю."
    );
  }

  return (
    <>
    <div className="app">
      <aside className="sidebar">
        <div className="sidebar__brand">
          <span className="brand-mark">
            <img alt="" src={assets.logoMark} />
          </span>
          <img alt="Нейрум" className="brand-wordmark" src={assets.logoWordmark} />
        </div>

        <div className="sidebar__divider" />

        <nav className="sidebar__nav">
          <NavLink className={({ isActive }) => menuClassName(isActive)} to="/">
            <span className="menu-icon">
              <img alt="" src={assets.navAssignment} />
            </span>
            <span>Задания</span>
            <span className="menu-counter">2</span>
          </NavLink>
          <NavLink className={({ isActive }) => menuClassName(isActive)} to="/profile">
            <span className="menu-icon">
              <img alt="" src={assets.navSettings} />
            </span>
            <span>Настройки профиля</span>
          </NavLink>
        </nav>

        <div className="sidebar__spacer" />

        <div className="sidebar__divider" />

        <div className="sidebar__profile">
          <div className="avatar-shell">
            <img alt="" src={assets.navAvatar} />
          </div>
          <div>
            <p>Артем П.</p>
            <span>ученик</span>
          </div>
        </div>
      </aside>

      <main className="main">
        <header className="main-header">
          <div className="main-header__title">
            <h1>{meta.title}</h1>
            {meta.subtitle ? <p>{meta.subtitle}</p> : null}
          </div>
          {meta.filter ? (
            <button className="filter-button" type="button">
              <span>{meta.filter}</span>
              <img alt="" src={assets.chevron} />
            </button>
          ) : null}
        </header>

        <div className="page">
          {showConsentBanner ? (
            <ConsentBanner
              daysLeft={state.daysLeft}
              expired={state.status === "grace_expired"}
              sent={state.status === "grace_active_sent"}
              onAction={handleQuickShare}
            />
          ) : null}

          {state.status === "confirmed" && !location.pathname.startsWith("/parent/confirm") ? (
            <SuccessNotice parentName={state.parentName ?? "Елена Викторовна"} />
          ) : null}

          <Routes>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/homework/:id" element={<HomeworkDetailPage />} />
            <Route path="/homework/:id/send" element={<HomeworkSendPage />} />
            <Route path="/profile" element={<ProfilePage onOpenSendLink={() => setShareOpen(true)} />} />
            <Route path="/parent/confirm" element={<ParentConfirmPage />} />
          </Routes>
        </div>
      </main>

      <button className="lab-toggle" onClick={() => setLabOpen((prev) => !prev)} type="button">
        {labOpen ? "Скрыть" : "Сценарии"}
      </button>

      {labOpen ? (
        <ScenarioLab
          onClose={() => setLabOpen(false)}
          onOpenShare={() => setShareOpen(true)}
          onReset={() => {
            dispatch({ type: "RESET" });
            navigate("/");
          }}
        />
      ) : null}

      {shareOpen ? (
        <ShareSheet
          onClose={() => setShareOpen(false)}
          onCopy={() => handleSendLink("copy")}
          onShare={() => handleSendLink("share")}
          url={SHARE_URL}
        />
      ) : null}

    </div>

    {toast ? (
      <div className="toast-backdrop" onClick={() => setToast(null)}>
        <div className="toast" onClick={(event) => event.stopPropagation()}>
          <div className="toast__icon">✓</div>
          <p className="toast__title">{toast}</p>
          <p className="toast__subtitle">Перешли ссылку родителю в любом мессенджере</p>
        </div>
      </div>
    ) : null}

    </>
  );
}

function menuClassName(isActive: boolean) {
  return isActive ? "menu-link menu-link--active" : "menu-link";
}

function ConsentBanner(props: {
  daysLeft: number;
  expired: boolean;
  sent: boolean;
  onAction: () => void;
}) {
  return (
    <section className="consent-banner">
      <div className="consent-banner__logo">
        <img alt="" src={assets.logoMark} />
      </div>
      <div className="consent-banner__body">
        <h2>
          {props.expired
            ? "Время вышло. Отправь ссылку родителю — это займёт пару минут"
            : props.sent
              ? <>Ссылка отправлена. Осталось <strong className={`countdown${props.daysLeft <= 1 ? " countdown--critical" : props.daysLeft <= 3 ? " countdown--warning" : ""}`}>{props.daysLeft} дн.</strong></>
              : <>Нужно согласие родителя. Осталось <strong className={`countdown${props.daysLeft <= 1 ? " countdown--critical" : props.daysLeft <= 3 ? " countdown--warning" : ""}`}>{props.daysLeft} дн.</strong></>}
        </h2>
        <p>
          Отправь ссылку маме или папе — они подтвердят за пару минут.
        </p>
      </div>
      <button className="primary-button" onClick={props.onAction} type="button">
        {props.sent ? "Отправить ещё раз" : "Отправить ссылку"}
      </button>
    </section>
  );
}

function SuccessNotice(props: { parentName: string }) {
  return (
    <section className="success-notice">
      <div>
        <h2>Согласие получено</h2>
        <p>{props.parentName} подтвердил(а) доступ. Теперь ты можешь сдавать домашние задания без ограничений.</p>
      </div>
      <span className="success-notice__badge">Подтверждено</span>
    </section>
  );
}

function DashboardPage() {
  return (
    <div className="sections">
      <HomeworkSection items={activeCards} title="Активные (3)" />
      <HomeworkSection items={debtCards} title="Долги (2)" />
      <HomeworkSection items={submittedCards} title="Сданные (10)" showMore />
    </div>
  );
}

function HomeworkSection(props: {
  items: HomeworkCardItem[];
  title: string;
  showMore?: boolean;
}) {
  return (
    <section className="homework-section">
      <h3>{props.title}</h3>
      <div className="cards-grid">
        {props.items.map((item) => (
          <HomeworkCard item={item} key={item.id} />
        ))}
      </div>
      {props.showMore ? (
        <button className="show-more-button" type="button">
          <span>Показать еще</span>
          <img alt="" src={assets.chevron} />
        </button>
      ) : null}
    </section>
  );
}

function HomeworkCard(props: { item: HomeworkCardItem }) {
  const isDefault = props.item.variant === "deadline";
  return (
    <article className={`homework-card ${isDefault ? "homework-card--soft" : ""}`}>
      <div className="homework-card__row">
        <span className="checkbox-shell" />
        <StatusTag item={props.item} />
      </div>

      <div className="homework-card__content">
        <p>{props.item.subject}</p>
        <h4>{props.item.title}</h4>
      </div>

      <div className="due-row">
        <img alt="" src={assets.calendar} />
        <span>{props.item.dueText}</span>
      </div>

      <div className="homework-card__actions">
        <NavLink className="card-action-main" to="/homework/42">
          Открыть задание
        </NavLink>
        <button className="card-action-side" type="button">
          <img alt="" src={assets.attach} />
        </button>
      </div>
    </article>
  );
}

function StatusTag(props: { item: HomeworkCardItem }) {
  if (props.item.variant === "score") {
    return (
      <div className="status-tag status-tag--score">
        <span>{props.item.tagText}</span>
        <b>{props.item.score}</b>
      </div>
    );
  }

  if (props.item.variant === "waiting") {
    return (
      <div className="status-tag status-tag--waiting">
        <img alt="" src={assets.tagAlarm} />
        <span>{props.item.tagText}</span>
      </div>
    );
  }

  if (props.item.variant === "debt" || props.item.variant === "problems") {
    return (
      <div className="status-tag status-tag--critical">
        <img alt="" src={assets.tagAlarm} />
        <span>{props.item.tagText}</span>
      </div>
    );
  }

  return (
    <div className="status-tag status-tag--deadline">
      <img alt="" src={assets.tagAlarm} />
      <span>{props.item.tagText}</span>
    </div>
  );
}

function HomeworkTopBar() {
  return (
    <div className="homework-topbar">
      <NavLink className="back-button" to="/">
        <img alt="" src={assets.backChevron} />
      </NavLink>
      <div className="homework-topbar__meta">
        <h2>Просмотр задания</h2>
        <p>Математика</p>
      </div>
    </div>
  );
}

function HomeworkDescriptionCard(props: {
  showActions: boolean;
}) {
  return (
    <section className="homework-card-shell">
      <div className="homework-card-shell__body">
        <div className="homework-info-block">
          <h3>Описание задания</h3>
          <p>стр. 20, задание 10, 11 и 12, ещё дополнительно можно сделать стр. 22, задание 1, 2 и 5 параграфа 10</p>
        </div>

        <div className="homework-info-block">
          <h3>Сдать до</h3>
          <div className="due-row due-row--detail">
            <img alt="" src={assets.calendarOutline} />
            <p>
              <strong>30 января</strong>
              <span>(осталось 5 дней)</span>
            </p>
          </div>
        </div>

        <div className="homework-info-block">
          <h3>Прикрепленные фото</h3>
          <div className="attachment-grid">
            <article className="attachment-photo">
              <img alt="Фото домашнего задания 1" src={assets.detailPhoto} />
              <span className="attachment-photo__badge">
                <img alt="" src={assets.detailExpand} />
              </span>
            </article>
            <article className="attachment-photo">
              <img alt="Фото домашнего задания 2" src={assets.detailPhoto} />
              <span className="attachment-photo__badge">
                <img alt="" src={assets.detailExpand} />
              </span>
            </article>
          </div>
        </div>
      </div>

      {props.showActions ? (
        <div className="detail-actions">
          <NavLink className="primary-button primary-button--fit primary-button--icon" to="/homework/42/send">
            <img alt="" src={assets.buttonBolt} />
            <span>Сдать ДЗ на проверку</span>
          </NavLink>
          <button className="hint-button" type="button">
            <img alt="" src={assets.helpIcon} />
            <span>Как правильно фотографировать?</span>
            <img alt="" src={assets.chevron} />
          </button>
        </div>
      ) : null}
    </section>
  );
}

function HomeworkDetailPage() {
  return (
    <div className="detail-stack">
      <HomeworkTopBar />

      <section className="review-banner review-banner--progress">
        <div className="review-banner__copy">
          <h3>Домашнее задание отправлено на проверку</h3>
          <p>Результат проверки будет доступен после того, как учитель в своём личном кабинете выставит тебе оценку.</p>
        </div>
        <span className="signal-badge signal-badge--purple">
          <span className="signal-badge__inner signal-badge__inner--purple">
            <img alt="" src={assets.reviewBolt} />
          </span>
        </span>
      </section>

      <HomeworkDescriptionCard showActions />
    </div>
  );
}

function HomeworkSendPage() {
  const { state, dispatch } = useDemoState();

  return (
    <div className="detail-stack">
      <HomeworkTopBar />

      <section className="problem-review">
        <div className="problem-review__top">
          <div className="problem-review__content">
            <div className="problem-review__copy">
              <h3>Обнаружены проблемы с фотографиями</h3>
              <p>
                На изображении <strong>не найден текст решения</strong>. Пожалуйста, сделайте новые фото этой домашней
                работы и отправьте повторно на проверку.
              </p>
            </div>

            <div className="problem-photos">
              <article className="problem-photo">
                <img alt="Проблемное фото 1" src={assets.problemPhoto1} />
                <span className="problem-photo__badge">
                  <img alt="" src={assets.warningSmall} />
                </span>
              </article>
              <article className="problem-photo">
                <img alt="Проблемное фото 2" src={assets.problemPhoto2} />
                <span className="problem-photo__badge">
                  <img alt="" src={assets.warningSmall} />
                </span>
              </article>
              <article className="problem-photo">
                <img alt="Проблемное фото 3" src={assets.problemPhoto3} />
                <span className="problem-photo__badge">
                  <img alt="" src={assets.warningSmall} />
                </span>
              </article>
              <article className="problem-photo">
                <img alt="Проблемное фото 4" src={assets.problemPhoto4} />
                <span className="problem-photo__badge">
                  <img alt="" src={assets.warningSmall} />
                </span>
              </article>
            </div>
          </div>

          <span className="signal-badge signal-badge--warning">
            <span className="signal-badge__inner signal-badge__inner--warning">
              <img alt="" src={assets.warningMain} />
            </span>
          </span>
        </div>

        <div className="detail-actions">
          <button className="primary-button primary-button--fit primary-button--icon" onClick={() => dispatch({ type: "SUBMIT_HOMEWORK" })} type="button">
            <img alt="" src={assets.buttonBolt} />
            <span>Загрузить новые фото</span>
          </button>
          <button className="hint-button" type="button">
            <img alt="" src={assets.helpIcon} />
            <span>Как правильно фотографировать?</span>
            <img alt="" src={assets.chevron} />
          </button>
        </div>

        {state.homeworkSubmitted ? (
          <div className="success-panel">Новые фото отправлены. Учитель увидит повторную сдачу в ближайшее время.</div>
        ) : null}
      </section>

      <HomeworkDescriptionCard showActions={false} />
    </div>
  );
}

function GraceProgressBar(props: { daysLeft: number; total: number }) {
  const pct = Math.max(0, Math.min(100, (props.daysLeft / props.total) * 100));
  const urgent = props.daysLeft <= 1;
  const warning = props.daysLeft <= 3;
  return (
    <div className="grace-progress">
      <div
        className={`grace-progress__bar${urgent ? " grace-progress__bar--critical" : warning ? " grace-progress__bar--warning" : ""}`}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

function ProfilePage(props: { onOpenSendLink: () => void }) {
  const { state } = useDemoState();
  const confirmed = state.status === "confirmed";
  const expired = state.status === "grace_expired";

  return (
    <div className="detail-layout">
      <section className="surface-card surface-card--wide">
        <div className="surface-card__header">
          <div>
            <h3>Согласие родителя</h3>
            <p>Статус подтверждения от родителя</p>
          </div>
          <span className={`mini-badge ${confirmed ? "mini-badge--success" : expired ? "mini-badge--danger" : ""}`}>{statusLabel(state.status)}</span>
        </div>

        {!confirmed && !expired ? (
          <GraceProgressBar daysLeft={state.daysLeft} total={7} />
        ) : null}

        <div className="profile-panel">
          <div className="profile-panel__block">
            <span>Текущее состояние</span>
            <strong>
              {confirmed
                ? `Подтверждено: ${state.parentName}`
                : expired
                  ? "Время вышло"
                  : `Осталось ${state.daysLeft} дн.`}
            </strong>
          </div>
          <div className="profile-panel__block">
            <span>Последняя отправка ссылки</span>
            <strong>{state.lastLinkSentAt ?? "ещё не отправляли"}</strong>
          </div>
        </div>

        {confirmed ? (
          <div className="linked-parent">
            <div className="avatar-shell">
              <img alt="" src={assets.navAvatar} />
            </div>
            <div>
              <p>Елена Викторовна</p>
              <span>+7 999 123 45 67</span>
            </div>
          </div>
        ) : (
          <button className="primary-button primary-button--fit" onClick={props.onOpenSendLink} type="button">
            {state.sendCount > 0 ? "Отправить ссылку ещё раз" : "Отправить ссылку родителю"}
          </button>
        )}
      </section>
    </div>
  );
}

function ParentConfirmPage() {
  const navigate = useNavigate();
  const { dispatch } = useDemoState();
  const [agreed, setAgreed] = useState(false);

  return (
    <section className="surface-card surface-card--parent">
      <div className="parent-hero">
        <div className="consent-banner__logo">
          <img alt="" src={assets.logoMark} />
        </div>
        <div>
          <h2>Согласие на обработку данных</h2>
          <p>Заполните данные, чтобы подтвердить использование сервиса Нейрум вашим ребёнком — учеником Артемом П.</p>
        </div>
      </div>

      <div className="parent-form">
        <div className="parent-form__row">
          <label className="parent-form__field">
            <span>Фамилия</span>
            <input defaultValue="Петрова" placeholder="Фамилия" type="text" />
          </label>
          <label className="parent-form__field">
            <span>Имя</span>
            <input defaultValue="Елена" placeholder="Имя" type="text" />
          </label>
          <label className="parent-form__field">
            <span>Отчество</span>
            <input defaultValue="Викторовна" placeholder="Отчество" type="text" />
          </label>
        </div>
        <div className="parent-form__row">
          <label className="parent-form__field">
            <span>Телефон</span>
            <input defaultValue="+7 999 123 45 67" placeholder="+7" type="tel" />
          </label>
          <label className="parent-form__field">
            <span>Email (необязательно)</span>
            <input placeholder="email@example.com" type="email" />
          </label>
        </div>

        <label className="parent-form__checkbox">
          <input checked={agreed} onChange={() => setAgreed((v) => !v)} type="checkbox" />
          <span>
            Я даю согласие на обработку персональных данных моего ребёнка в соответствии с{" "}
            <a href="/policy" target="_blank">политикой конфиденциальности</a>
          </span>
        </label>
      </div>

      <div className="parent-actions">
        <button
          className="primary-button primary-button--fit"
          disabled={!agreed}
          onClick={() => {
            dispatch({ type: "CONFIRM_PARENT" });
            navigate("/profile");
          }}
          type="button"
        >
          Подтвердить согласие
        </button>
      </div>
    </section>
  );
}

function ScenarioLab(props: {
  onClose: () => void;
  onOpenShare: () => void;
  onReset: () => void;
}) {
  const { state, dispatch } = useDemoState();

  return (
    <aside className="lab">
      <div className="lab__header">
        <div>
          <p>Сценарии</p>
          <strong>{statusLabel(state.status)} · {state.daysLeft} дн.</strong>
        </div>
        <button className="lab__close" onClick={props.onClose} type="button">
          Закрыть
        </button>
      </div>

      <div className="lab__buttons">
        <button className="lab__button" onClick={() => dispatch({ type: "ADVANCE_DAY" })} type="button">
          −1 день
        </button>
        <button className="lab__button" onClick={() => dispatch({ type: "CONFIRM_PARENT" })} type="button">
          Родитель подтвердил
        </button>
        <button className="lab__button" onClick={() => dispatch({ type: "SET_STATUS", status: "grace_expired" })} type="button">
          Время вышло
        </button>
        <button className="lab__button" onClick={props.onReset} type="button">
          Сначала
        </button>
      </div>
    </aside>
  );
}

function ShareSheet(props: {
  onClose: () => void;
  onCopy: () => void;
  onShare: () => void;
  url: string;
}) {
  return (
    <div className="modal-backdrop" onClick={props.onClose}>
      <div className="share-sheet" onClick={(event) => event.stopPropagation()}>
        <div className="share-sheet__header">
          <div>
            <h3>Отправить ссылку родителю</h3>
            <p>Родитель перейдёт по ссылке и подтвердит согласие.</p>
          </div>
          <button className="share-sheet__close" onClick={props.onClose} type="button">
            Закрыть
          </button>
        </div>

        <div className="share-sheet__preview">{props.url}</div>

        <div className="share-sheet__actions">
          <button className="primary-button primary-button--fit" onClick={props.onShare} type="button">
            Поделиться ссылкой
          </button>
          <button className="secondary-button" onClick={props.onCopy} type="button">
            Скопировать ссылку
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;
