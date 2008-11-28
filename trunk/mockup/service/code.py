import web

urls = (
    '/fast', 'fast.FASTSrv.view',
    '/store', 'fast.StoreSrv.view'
)

web.webapi.internalerror = web.debugerror
if __name__ == "__main__": web.run(urls, globals(), web.reloader)
