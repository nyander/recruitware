const Ziggy = {"url":"http:\/\/localhost","port":null,"defaults":{},"routes":{"debugbar.openhandler":{"uri":"_debugbar\/open","methods":["GET","HEAD"]},"debugbar.clockwork":{"uri":"_debugbar\/clockwork\/{id}","methods":["GET","HEAD"],"parameters":["id"]},"debugbar.assets.css":{"uri":"_debugbar\/assets\/stylesheets","methods":["GET","HEAD"]},"debugbar.assets.js":{"uri":"_debugbar\/assets\/javascript","methods":["GET","HEAD"]},"debugbar.cache.delete":{"uri":"_debugbar\/cache\/{key}\/{tags?}","methods":["DELETE"],"parameters":["key","tags"]},"sanctum.csrf-cookie":{"uri":"sanctum\/csrf-cookie","methods":["GET","HEAD"]},"dashboard":{"uri":"dashboard","methods":["GET","HEAD"]},"profile.edit":{"uri":"profile","methods":["GET","HEAD"]},"profile.update":{"uri":"profile","methods":["PATCH"]},"profile.destroy":{"uri":"profile","methods":["DELETE"]},"tablesubmissions.index":{"uri":"tablesubmissions","methods":["GET","HEAD"]},"tablesubmissions.create":{"uri":"tablesubmissions\/create","methods":["GET","HEAD"]},"tablesubmissions.store":{"uri":"tablesubmissions","methods":["POST"]},"bookings.index":{"uri":"bookings","methods":["GET","HEAD"]},"clients.index":{"uri":"clients","methods":["GET","HEAD"]},"candidates.live":{"uri":"candidates\/live","methods":["GET","HEAD"]},"candidates.new":{"uri":"candidates\/new","methods":["GET","HEAD"]},"candidates.audit":{"uri":"candidates\/audit","methods":["GET","HEAD"]},"candidates.pending":{"uri":"candidates\/pending","methods":["GET","HEAD"]},"candidates.leavers":{"uri":"candidates\/leavers","methods":["GET","HEAD"]},"candidates.archive":{"uri":"candidates\/archive","methods":["GET","HEAD"]},"candidates.no-contact":{"uri":"candidates\/no-contact","methods":["GET","HEAD"]},"clients.contacts":{"uri":"clients\/contacts","methods":["GET","HEAD"]},"clients.jobs":{"uri":"clients\/jobs","methods":["GET","HEAD"]},"clients.contracts":{"uri":"clients\/contracts","methods":["GET","HEAD"]},"clients.second-tier-contracts":{"uri":"clients\/second-tier-contracts","methods":["GET","HEAD"]},"clients.archive":{"uri":"clients\/archive","methods":["GET","HEAD"]},"hr.staff-details":{"uri":"hr\/staff-details","methods":["GET","HEAD"]},"hr.supplier-companies":{"uri":"hr\/supplier-companies","methods":["GET","HEAD"]},"hr.training":{"uri":"hr\/training","methods":["GET","HEAD"]},"hr.hot-arrivals":{"uri":"hr\/hot-arrivals","methods":["GET","HEAD"]},"hr.staff-reporting":{"uri":"hr\/staff-reporting","methods":["GET","HEAD"]},"hr.starters":{"uri":"hr\/starters","methods":["GET","HEAD"]},"hr.leavers":{"uri":"hr\/leavers","methods":["GET","HEAD"]},"hr.audit":{"uri":"hr\/audit","methods":["GET","HEAD"]},"rota.staff":{"uri":"rota\/staff","methods":["GET","HEAD"]},"rota.meetings":{"uri":"rota\/meetings","methods":["GET","HEAD"]},"rota.staff-hours":{"uri":"rota\/staff-hours","methods":["GET","HEAD"]},"planning.ad-hoc":{"uri":"planning\/ad-hoc","methods":["GET","HEAD"]},"planning.fte-shifts":{"uri":"planning\/fte-shifts","methods":["GET","HEAD"]},"planning.daily-bookings":{"uri":"planning\/daily-bookings","methods":["GET","HEAD"]},"planning.unfilled-bookings":{"uri":"planning\/unfilled-bookings","methods":["GET","HEAD"]},"planning.unfilled-shifts":{"uri":"planning\/unfilled-shifts","methods":["GET","HEAD"]},"planning.cancelled-bookings":{"uri":"planning\/cancelled-bookings","methods":["GET","HEAD"]},"planning.timesheets":{"uri":"planning\/timesheets","methods":["GET","HEAD"]},"planning.oncall-sheets":{"uri":"planning\/oncall-sheets","methods":["GET","HEAD"]},"planning.payroll-issues":{"uri":"planning\/payroll-issues","methods":["GET","HEAD"]},"payroll.client-hours":{"uri":"payroll\/client-hours","methods":["GET","HEAD"]},"payroll.costings":{"uri":"payroll\/costings","methods":["GET","HEAD"]},"payroll.invoicing":{"uri":"payroll\/invoicing","methods":["GET","HEAD"]},"payroll.payroll":{"uri":"payroll\/payroll","methods":["GET","HEAD"]},"payroll.remittances":{"uri":"payroll\/remittances","methods":["GET","HEAD"]},"payroll.reports":{"uri":"payroll\/reports","methods":["GET","HEAD"]},"invoicing.financial":{"uri":"invoicing\/financial","methods":["GET","HEAD"]},"invoicing.hr-report":{"uri":"invoicing\/hr-report","methods":["GET","HEAD"]},"register":{"uri":"register","methods":["GET","HEAD"]},"login":{"uri":"login","methods":["GET","HEAD"]},"password.request":{"uri":"forgot-password","methods":["GET","HEAD"]},"password.email":{"uri":"forgot-password","methods":["POST"]},"password.reset":{"uri":"reset-password\/{token}","methods":["GET","HEAD"],"parameters":["token"]},"password.store":{"uri":"reset-password","methods":["POST"]},"verification.notice":{"uri":"verify-email","methods":["GET","HEAD"]},"verification.verify":{"uri":"verify-email\/{id}\/{hash}","methods":["GET","HEAD"],"parameters":["id","hash"]},"verification.send":{"uri":"email\/verification-notification","methods":["POST"]},"password.confirm":{"uri":"confirm-password","methods":["GET","HEAD"]},"password.update":{"uri":"password","methods":["PUT"]},"logout":{"uri":"logout","methods":["POST"]}}};
if (typeof window !== 'undefined' && typeof window.Ziggy !== 'undefined') {
  Object.assign(Ziggy.routes, window.Ziggy.routes);
}
export { Ziggy };
