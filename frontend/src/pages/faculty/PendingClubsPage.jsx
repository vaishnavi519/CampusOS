import { useMemo, useState } from "react";
import { useAsync } from "../../hooks/index.js";
import { clubService } from "../../services/index.js";
import "./PendingClubsPage.css";

export function PendingClubsPage() {
  const [search, setSearch] = useState("");
  const [processingId, setProcessingId] = useState(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const {
    data: clubs = [],
    loading,
    error: loadError,
    refetch,
  } = useAsync(() => clubService.listClubs());

  const pendingClubs = useMemo(() => {
    const query = search.trim().toLowerCase();

    return clubs.filter((club) => {
      const isPending =
        String(club.status || "").toUpperCase() === "PENDING";

      const matchesSearch =
        !query ||
        [club.name, club.category, club.description]
          .some((value) =>
            String(value || "").toLowerCase().includes(query)
          );

      return isPending && matchesSearch;
    });
  }, [clubs, search]);

  async function handleDecision(club, decision) {
    const action = decision === "APPROVED" ? "approve" : "reject";

    const confirmed = window.confirm(
      `Are you sure you want to ${action} "${club.name}"?`
    );

    if (!confirmed) return;

    setProcessingId(club.id);
    setMessage("");
    setError("");

    try {
      await clubService.approveClub(club.id, decision);

      setMessage(
        `"${club.name}" was ${decision === "APPROVED" ? "approved" : "rejected"}.`
      );

      await refetch();
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          `Unable to ${action} this club. Please try again.`
      );
    } finally {
      setProcessingId(null);
    }
  }

  return (
    <main className="pending-clubs-page">
      <header className="pending-clubs-header">
        <div>
          <p className="pending-clubs-eyebrow">CLUB MANAGEMENT</p>
          <h1>Pending clubs</h1>
          <p className="pending-clubs-description">
            Review club applications and decide which clubs can become active
            on CampusOS.
          </p>
        </div>

        <button
          type="button"
          className="pending-clubs-refresh"
          onClick={refetch}
          disabled={loading}
        >
          {loading ? "Refreshing..." : "Refresh"}
        </button>
      </header>

      {message && (
        <div className="pending-clubs-notice pending-clubs-notice--success" role="status">
          {message}
        </div>
      )}

      {(error || loadError) && (
        <div className="pending-clubs-notice pending-clubs-notice--error" role="alert">
          {error || loadError?.message || "Unable to load clubs."}
        </div>
      )}

      <section className="pending-clubs-toolbar">
        <div>
          <h2>Applications</h2>
          <p>
            {pendingClubs.length} pending{" "}
            {pendingClubs.length === 1 ? "application" : "applications"}
          </p>
        </div>

        <input
          type="search"
          className="pending-clubs-search"
          placeholder="Search clubs..."
          aria-label="Search pending clubs"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
      </section>

      {loading && clubs.length === 0 ? (
        <div className="pending-clubs-state">
          Loading club applications...
        </div>
      ) : pendingClubs.length === 0 ? (
        <div className="pending-clubs-state">
          <h3>
            {search.trim()
              ? "No matching applications"
              : "No pending applications"}
          </h3>
          <p>
            {search.trim()
              ? "Try a different search term."
              : "New club applications will appear here when they are submitted."}
          </p>
        </div>
      ) : (
        <div className="pending-clubs-list">
          {pendingClubs.map((club) => (
            <article className="pending-club-card" key={club.id}>
              <div className="pending-club-card__content">
                <div className="pending-club-card__title-row">
                  <h3>{club.name}</h3>
                  <span className="pending-club-status">Pending review</span>
                </div>

                <p className="pending-club-category">
                  {club.category || "Uncategorised"}
                </p>

                <p className="pending-club-description">
                  {club.description || "No description provided."}
                </p>

                <p className="pending-club-id">Club ID: {club.id}</p>
              </div>

              <div className="pending-club-card__actions">
                <button
                  type="button"
                  className="pending-club-button pending-club-button--approve"
                  disabled={processingId !== null}
                  onClick={() => handleDecision(club, "APPROVED")}
                >
                  {processingId === club.id ? "Processing..." : "Approve"}
                </button>

                <button
                  type="button"
                  className="pending-club-button pending-club-button--reject"
                  disabled={processingId !== null}
                  onClick={() => handleDecision(club, "REJECTED")}
                >
                  Reject
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </main>
  );
}
